import { URL } from "node:url";
import { hasPermission, resolveAuthContext } from "../../infrastructure/security/authorization.js";
import { checkEtag, fail, ok, readJsonBody } from "./http.js";

export function createI18nRoutes({ i18nService, authOptions }) {
  return async function handleI18n(req, res) {
    const requestUrl = new URL(req.url, "http://localhost");
    const pathname = requestUrl.pathname;
    const auth = resolveAuthContext(req, authOptions);

    if (!auth.authenticated) {
      fail(res, 401, "ERR_UNAUTHORIZED", "ERR_UNAUTHORIZED");
      return true;
    }

    if (pathname === "/api/i18n/version" && req.method === "GET") {
      if (!hasPermission(auth, "i18n.read")) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      ok(res, { version: i18nService.getVersion() });
      return true;
    }

    if (pathname === "/api/i18n/languages" && req.method === "GET") {
      if (!hasPermission(auth, "i18n.read")) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      const languages = await i18nService.getLanguages();
      ok(res, languages);
      return true;
    }

    if (pathname === "/api/i18n/resources" && req.method === "GET") {
      if (!hasPermission(auth, "i18n.read")) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      const etag = `"${i18nService.getVersion()}"`;
      if (checkEtag(req, etag)) {
        res.writeHead(304);
        res.end();
        return true;
      }

      const resources = await i18nService.getResources();
      ok(res, resources, undefined, { ETag: etag, "Cache-Control": "public, max-age=1800" });
      return true;
    }

    if (pathname === "/api/i18n/resources" && req.method === "POST") {
      if (!hasPermission(auth, "i18n.write")) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      try {
        const body = await readJsonBody(req);
        await i18nService.saveResource({ ...body, actor: auth.userId });
        ok(res, { saved: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "I18N_KEY_PROTECTED") {
          fail(res, 400, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
          return true;
        }
        fail(res, 400, "ERR_INVALID_ARGUMENT", "ERR_INVALID_ARGUMENT");
      }
      return true;
    }

    if (pathname === "/api/i18n/cache/reload" && req.method === "POST") {
      if (!hasPermission(auth, "i18n.cache.reload")) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      await i18nService.reloadCache();
      ok(res, { reloaded: true });
      return true;
    }

    if (pathname.startsWith("/api/i18n/") && req.method === "GET") {
      if (!hasPermission(auth, "i18n.read")) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      const pathLang = pathname.replace("/api/i18n/", "");
      if (!pathLang || pathLang.includes("/")) {
        return false;
      }

      const languages = await i18nService.getLanguages();
      const defaultLang = languages[0]?.code || "en";
      const lang = i18nService.resolveLanguage({
        pathLang,
        queryLang: requestUrl.searchParams.get("lang"),
        headerLang: req.headers["x-lang"],
        acceptLanguage: req.headers["accept-language"],
        defaultLang
      });

      const version = i18nService.getVersion();
      const etag = `"${version}_${lang}"`;
      if (checkEtag(req, etag)) {
        res.writeHead(304);
        res.end();
        return true;
      }

      const dictionary = await i18nService.getDictionary(lang);
      ok(res, dictionary, undefined, { ETag: etag, "Cache-Control": "public, max-age=1800" });
      return true;
    }

    if (pathname === "/api/i18n" && req.method === "GET") {
      if (!hasPermission(auth, "i18n.read")) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      const languages = await i18nService.getLanguages();
      const defaultLang = languages[0]?.code || "en";
      const lang = i18nService.resolveLanguage({
        pathLang: null,
        queryLang: requestUrl.searchParams.get("lang"),
        headerLang: req.headers["x-lang"],
        acceptLanguage: req.headers["accept-language"],
        defaultLang
      });

      const version = i18nService.getVersion();
      const etag = `"${version}_${lang}"`;
      if (checkEtag(req, etag)) {
        res.writeHead(304);
        res.end();
        return true;
      }

      const dictionary = await i18nService.getDictionary(lang);
      ok(res, dictionary, undefined, { ETag: etag, "Cache-Control": "public, max-age=1800" });
      return true;
    }

    return false;
  };
}
