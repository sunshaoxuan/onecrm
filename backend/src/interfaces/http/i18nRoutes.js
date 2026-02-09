import { URL } from "node:url";
import { checkEtag, fail, ok, readJsonBody } from "./http.js";

export function createI18nRoutes({ i18nService, authService }) {
  return async function handleI18n(req, res) {
    const requestUrl = new URL(req.url, "http://localhost");
    const pathname = requestUrl.pathname;

    if (pathname === "/api/i18n/version" && req.method === "GET") {
      ok(res, { version: i18nService.getVersion() });
      return true;
    }

    if (pathname === "/api/i18n/resources" && req.method === "GET") {
      const requestedLang = requestUrl.searchParams.get("lang");
      const languages = await i18nService.getLanguages();
      const supported = new Set(languages.map((item) => item.code));
      if (requestedLang && !supported.has(requestedLang.toLowerCase())) {
        fail(res, 400, "I18N_LANG_NOT_SUPPORTED", "I18N_LANG_NOT_SUPPORTED");
        return true;
      }
      const defaultLang = languages[0]?.code || "en";
      const lang = i18nService.resolveLanguage({
        pathLang: null,
        queryLang: requestedLang,
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

      const resources = await i18nService.getBundle(lang);
      ok(
        res,
        resources,
        { version: `v${version}`, lang },
        { ETag: etag, "Cache-Control": "public, max-age=1800" }
      );
      return true;
    }

    if (pathname === "/api/i18n/resources" && req.method === "POST") {
      const token = authService.parseBearerToken(req.headers.authorization);
      if (!authService.isAdmin(token)) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      try {
        const body = await readJsonBody(req);
        const result = await i18nService.saveBatchResources({
          lang: body.lang,
          force: body.force,
          items: body.items,
          actor: "admin"
        });
        ok(res, result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "I18N_KEY_PROTECTED") {
          fail(res, 409, "I18N_KEY_PROTECTED", "I18N_KEY_PROTECTED");
          return true;
        }
        if (message === "I18N_LANG_NOT_SUPPORTED") {
          fail(res, 400, "I18N_LANG_NOT_SUPPORTED", "I18N_LANG_NOT_SUPPORTED");
          return true;
        }
        fail(res, 400, "ERR_INVALID_ARGUMENT", "ERR_INVALID_ARGUMENT");
      }
      return true;
    }

    if (pathname === "/api/i18n/cache/reload" && req.method === "POST") {
      const token = authService.parseBearerToken(req.headers.authorization);
      if (!authService.isAdmin(token)) {
        fail(res, 403, "ERR_FORBIDDEN", "ERR_FORBIDDEN");
        return true;
      }

      await i18nService.reloadCache();
      ok(res, { reloaded: true });
      return true;
    }

    return false;
  };
}
