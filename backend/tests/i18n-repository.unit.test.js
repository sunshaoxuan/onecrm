import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { Readable } from "node:stream";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { FileI18nRepository } from "../src/infrastructure/i18n/FileI18nRepository.js";
import { S3I18nRepository } from "../src/infrastructure/i18n/S3I18nRepository.js";
import { createI18nRepository } from "../src/infrastructure/i18n/createI18nRepository.js";

test("FileI18nRepository creates store file on first read", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "onecrm-file-repo-"));
  const filePath = path.join(tempDir, "store.json");
  const repo = new FileI18nRepository({ filePath });

  const store = await repo.readStore();
  assert.equal(Array.isArray(store.languages), true);
  assert.equal(Array.isArray(store.resources), true);

  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  assert.equal(parsed.modelVersion, 1);

  await rm(tempDir, { recursive: true, force: true });
});

test("FileI18nRepository upsertResource updates existing entity defaults", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "onecrm-file-repo-upsert-"));
  const filePath = path.join(tempDir, "store.json");
  const repo = new FileI18nRepository({ filePath });
  const store = await repo.readStore();
  store.resources.push({
    id: "res-manual",
    key: "AUTH_PANEL_TITLE",
    translations: { en: "Sign In" },
    created_at: "",
    updated_at: "",
    created_by: "",
    updated_by: "",
    is_deleted: "x"
  });
  await repo.writeStore(store);

  await repo.upsertResource({
    key: "AUTH_PANEL_TITLE",
    culture: "zh",
    value: "登录",
    actor: "tester"
  });

  const saved = await repo.readStore();
  const row = saved.resources.find((item) => item.key === "AUTH_PANEL_TITLE");
  assert.equal(row.translations.zh, "登录");
  assert.equal(row.created_by, "system");
  assert.equal(row.updated_by, "tester");
  assert.equal(row.is_deleted, 0);

  await rm(tempDir, { recursive: true, force: true });
});

test("createI18nRepository returns file and s3 implementations", () => {
  const fileRepo = createI18nRepository({ driver: "file", filePath: "x.json" });
  assert.equal(fileRepo instanceof FileI18nRepository, true);
  assert.equal(fileRepo.filePath, "x.json");

  const s3Repo = createI18nRepository({
    driver: "minio",
    bucket: "onecrm-i18n",
    endpoint: "http://127.0.0.1:9000",
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin"
  });
  assert.equal(s3Repo instanceof S3I18nRepository, true);
  assert.equal(s3Repo.bucket, "onecrm-i18n");
});

test("createI18nRepository throws when s3 bucket missing", () => {
  assert.throws(
    () => createI18nRepository({ driver: "s3" }),
    /I18N_S3_BUCKET is required/
  );
});

test("S3I18nRepository ensureReady creates bucket when missing", async () => {
  const repo = new S3I18nRepository({
    endpoint: "http://127.0.0.1:9000",
    bucket: "bucket-a",
    accessKeyId: "ak",
    secretAccessKey: "sk"
  });

  const calls = [];
  repo.client = {
    send: async (command) => {
      calls.push(command);
      if (command instanceof HeadBucketCommand) {
        throw new Error("missing");
      }
      if (command instanceof CreateBucketCommand) {
        return {};
      }
      return {};
    }
  };

  await repo.ensureReady();
  await repo.ensureReady();
  assert.equal(calls.filter((cmd) => cmd instanceof HeadBucketCommand).length, 1);
  assert.equal(calls.filter((cmd) => cmd instanceof CreateBucketCommand).length, 1);
});

test("S3I18nRepository ensureReady throws when autoCreateBucket=false", async () => {
  const repo = new S3I18nRepository({
    endpoint: "http://127.0.0.1:9000",
    bucket: "bucket-b",
    accessKeyId: "ak",
    secretAccessKey: "sk",
    autoCreateBucket: false
  });

  repo.client = {
    send: async () => {
      throw new Error("not-found");
    }
  };

  await assert.rejects(() => repo.ensureReady(), /not-found/);
});

test("S3I18nRepository readStore returns normalized data and handles NoSuchKey", async () => {
  const repo = new S3I18nRepository({
    endpoint: "http://127.0.0.1:9000",
    bucket: "bucket-c",
    accessKeyId: "ak",
    secretAccessKey: "sk"
  });

  const putCalls = [];
  repo.client = {
    send: async (command) => {
      if (command instanceof HeadBucketCommand) {
        return {};
      }
      if (command instanceof GetObjectCommand) {
        throw { name: "NoSuchKey" };
      }
      if (command instanceof PutObjectCommand) {
        putCalls.push(command);
        return {};
      }
      return {};
    }
  };

  const defaults = await repo.readStore();
  assert.equal(Array.isArray(defaults.resources), true);
  assert.equal(putCalls.length, 1);

  repo.initialized = false;
  repo.client = {
    send: async (command) => {
      if (command instanceof HeadBucketCommand) {
        return {};
      }
      if (command instanceof GetObjectCommand) {
        return {
          Body: Readable.from([
            JSON.stringify({
              modelVersion: 1,
              languages: [{ code: "en", name: "English" }],
              resources: [{ key: "AUTH_PANEL_TITLE", translations: { en: "Sign In" } }]
            })
          ])
        };
      }
      return {};
    }
  };

  const loaded = await repo.readStore();
  assert.equal(loaded.resources[0].key, "AUTH_PANEL_TITLE");
  assert.equal(loaded.resources[0].translations.en, "Sign In");
});

test("S3I18nRepository write/get/upsert paths call expected commands", async () => {
  const repo = new S3I18nRepository({
    endpoint: "http://127.0.0.1:9000",
    bucket: "bucket-d",
    accessKeyId: "ak",
    secretAccessKey: "sk"
  });

  const sentCommands = [];
  repo.client = {
    send: async (command) => {
      sentCommands.push(command);
      if (command instanceof HeadBucketCommand) {
        return {};
      }
      if (command instanceof GetObjectCommand) {
        return {
          Body: Readable.from([
            JSON.stringify({
              modelVersion: 1,
              languages: [{ code: "zh", name: "中文" }],
              resources: []
            })
          ])
        };
      }
      if (command instanceof PutObjectCommand) {
        return {};
      }
      return {};
    }
  };

  await repo.writeStore({
    modelVersion: 1,
    languages: [{ code: "en", name: "English" }],
    resources: []
  });
  const languages = await repo.getLanguages();
  const resources = await repo.getResources();
  assert.equal(languages[0].code, "zh");
  assert.equal(Array.isArray(resources), true);

  await repo.upsertResource({
    key: "AUTH_PANEL_LOGIN_BTN",
    culture: "zh",
    value: "登录",
    actor: "tester"
  });
  await repo.upsertResource({
    key: "AUTH_PANEL_LOGIN_BTN",
    culture: "en",
    value: "Sign In",
    actor: "tester"
  });
  assert.equal(sentCommands.some((cmd) => cmd instanceof PutObjectCommand), true);
});
