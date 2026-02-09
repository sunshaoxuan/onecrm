import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileI18nRepository } from "./FileI18nRepository.js";
import { S3I18nRepository } from "./S3I18nRepository.js";

export function createI18nRepository(options = {}) {
  const driver = (options.driver || process.env.I18N_STORE_DRIVER || "file").toLowerCase();

  if (driver === "s3" || driver === "minio") {
    const bucket = options.bucket || process.env.I18N_S3_BUCKET;
    if (!bucket) {
      throw new Error("I18N_S3_BUCKET is required when I18N_STORE_DRIVER is s3/minio");
    }

    return new S3I18nRepository({
      endpoint: options.endpoint || process.env.I18N_S3_ENDPOINT,
      region: options.region || process.env.I18N_S3_REGION || "us-east-1",
      accessKeyId: options.accessKeyId || process.env.I18N_S3_ACCESS_KEY_ID,
      secretAccessKey: options.secretAccessKey || process.env.I18N_S3_SECRET_ACCESS_KEY,
      bucket,
      key: options.key || process.env.I18N_S3_OBJECT_KEY || "onecrm/i18n-store.json",
      forcePathStyle:
        options.forcePathStyle ??
        (process.env.I18N_S3_FORCE_PATH_STYLE || "true").toLowerCase() === "true",
      autoCreateBucket:
        options.autoCreateBucket ??
        (process.env.I18N_S3_AUTO_CREATE_BUCKET || "true").toLowerCase() === "true"
    });
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const filePath =
    options.filePath ||
    process.env.I18N_STORE_FILE ||
    path.resolve(__dirname, "../../../data/i18n-store.json");

  return new FileI18nRepository({ filePath });
}

