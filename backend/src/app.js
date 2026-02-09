import http from "node:http";
import crypto from "node:crypto";
import { AuthService } from "./application/auth/AuthService.js";
import { I18nService } from "./application/i18n/I18nService.js";
import { SetupService } from "./application/setup/SetupService.js";
import { InMemoryCache } from "./infrastructure/cache/InMemoryCache.js";
import { createI18nRepository } from "./infrastructure/i18n/createI18nRepository.js";
import { createAuthRoutes } from "./interfaces/http/authRoutes.js";
import { createI18nRoutes } from "./interfaces/http/i18nRoutes.js";
import { createSetupRoutes } from "./interfaces/http/setupRoutes.js";
import { notFound, sendJson } from "./interfaces/http/http.js";

export function createApp(options = {}) {
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
  const authService = new AuthService({
    users: options.authUsers,
    passwordResetSender: options.passwordResetSender
  });
  const setupService = new SetupService({
    initialized: options.setupInitialized,
    maintenance: options.setupMaintenance
  });
  const i18nService = new I18nService({ repository, cache });
  const authRoutes = createAuthRoutes({ authService });
  const setupRoutes = createSetupRoutes({ setupService });
  const i18nRoutes = createI18nRoutes({ i18nService, authService });

  const server = http.createServer(async (req, res) => {
    const traceId = crypto.randomUUID();
    const start = process.hrtime.bigint();
    const token = authService.parseBearerToken(req.headers.authorization);
    const me = authService.getCurrentUser(token);
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
        user: me.ok ? me.data.username : "anonymous"
      };
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(log));
    });

    try {
      if (req.method === "GET" && req.url === "/health") {
        sendJson(res, 200, { status: "success", data: "ok" });
        return;
      }

      const handled =
        (await setupRoutes(req, res)) ||
        (await authRoutes(req, res)) ||
        (await i18nRoutes(req, res));
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
