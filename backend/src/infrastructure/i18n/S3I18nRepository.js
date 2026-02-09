import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { createDefaultStore, normalizeStore } from "../../domain/i18n/storeModel.js";

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export class S3I18nRepository {
  constructor(options) {
    this.bucket = options.bucket;
    this.key = options.key || "onecrm/i18n-store.json";
    this.autoCreateBucket = options.autoCreateBucket !== false;
    this.client = new S3Client({
      region: options.region || "us-east-1",
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle !== false,
      credentials: options.accessKeyId
        ? {
            accessKeyId: options.accessKeyId,
            secretAccessKey: options.secretAccessKey || ""
          }
        : undefined
    });
    this.initialized = false;
  }

  async ensureReady() {
    if (this.initialized) {
      return;
    }

    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      if (!this.autoCreateBucket) {
        throw error;
      }

      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }

    this.initialized = true;
  }

  async readStore() {
    await this.ensureReady();

    try {
      const output = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.key
        })
      );

      const raw = await streamToString(output.Body);
      const parsed = JSON.parse(raw);
      return normalizeStore(parsed, "s3");
    } catch (error) {
      const missing = error instanceof NoSuchKey || error?.name === "NoSuchKey";
      if (!missing) {
        throw error;
      }

      const defaults = normalizeStore(createDefaultStore(), "s3");
      await this.writeStore(defaults);
      return defaults;
    }
  }

  async writeStore(store) {
    await this.ensureReady();
    const normalized = normalizeStore(store, "s3");
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key,
        ContentType: "application/json; charset=utf-8",
        Body: JSON.stringify(normalized, null, 2)
      })
    );
  }

  async getLanguages() {
    const store = await this.readStore();
    return store.languages;
  }

  async getResources() {
    const store = await this.readStore();
    return store.resources;
  }

  async upsertResource({ key, culture, value, actor }) {
    const store = await this.readStore();
    const index = store.resources.findIndex((item) => item.key === key);
    const now = new Date().toISOString();

    if (index === -1) {
      store.resources.push({
        id: `res-${Math.random().toString(36).slice(2, 10)}`,
        key,
        translations: {
          [culture]: value
        },
        created_at: now,
        updated_at: now,
        created_by: actor || "system",
        updated_by: actor || "system",
        is_deleted: 0
      });
    } else {
      const current = store.resources[index];
      current.translations = {
        ...(current.translations || {}),
        [culture]: value
      };
      current.updated_at = now;
      current.updated_by = actor || "system";
      if (!current.created_at) {
        current.created_at = now;
      }
      if (!current.created_by) {
        current.created_by = actor || "system";
      }
      if (!Number.isInteger(current.is_deleted)) {
        current.is_deleted = 0;
      }
      store.resources[index] = current;
    }

    await this.writeStore(store);
  }
}
