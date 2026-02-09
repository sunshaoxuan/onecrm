import http from "node:http";
import crypto from "node:crypto";
import { I18nService } from "./application/i18n/I18nService.js";
import { InMemoryCache } from "./infrastructure/cache/InMemoryCache.js";
import { resolveAuthContext } from "./infrastructure/security/authorization.js";
import { createI18nRepository } from "./infrastructure/i18n/createI18nRepository.js";
import { createI18nRoutes } from "./interfaces/http/i18nRoutes.js";
import { notFound, sendJson } from "./interfaces/http/http.js";

export function createApp(options = {}) {
  const failOpen = options.failOpen || false;
  const authOptions = { failOpen };

  const repository = createI18nRepository({
    driver: options.storeDriver,
    filePath: options.dataFilePath,
    endpoint: options.s3Endpoint,
    region: options.s3Region,
    accessKeyId: options.s3AccessKeyId,
    secretAccessKey: options.s3SecretAccessKey,
    bucket: options.s3Bucket,
    key: options.s3ObjectKey,
    forcePathStyle: options.s3ForcePathStyle,
    autoCreateBucket: options.s3AutoCreateBucket
  });
  const cache = new InMemoryCache();
  const i18nService = new I18nService({ repository, cache });
  const i18nRoutes = createI18nRoutes({ i18nService, authOptions });

  const server = http.createServer(async (req, res) => {
    const traceId = crypto.randomUUID();
    const start = process.hrtime.bigint();
    const auth = resolveAuthContext(req, authOptions);
    res.setHeader("x-trace-id", traceId);

    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const costMs = Number(end - start) / 1_000_000;
      const status = res.statusCode;
      const level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
      const log = {
        level,
        trace_id: traceId,
        method: req.method,
        path: req.url,
        cost_ms: Number(costMs.toFixed(2)),
        status,
        user: auth.userId || "anonymous"
      };
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(log));
    });

    try {
      if (req.method === "GET" && req.url === "/health") {
        sendJson(res, 200, { status: "success", data: "ok" });
        return;
      }

      const handled = await i18nRoutes(req, res);
      if (!handled) {
        notFound(res);
      }
    } catch (error) {
      sendJson(res, 500, {
        status: "error",
        error_code: "ERR_INTERNAL_ERROR",
        message: "ERR_INTERNAL_ERROR"
      });
    }
  });

  return server;
}
