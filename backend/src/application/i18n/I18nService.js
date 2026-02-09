import { FALLBACK_LANGUAGES } from "../../domain/i18n/constants.js";
import { normalizeLanguage, parseAcceptLanguage } from "../../domain/i18n/language.js";
import { isProtectedKey, resolveTranslation } from "../../domain/i18n/translation.js";

export class I18nService {
  constructor({ repository, cache }) {
    this.repository = repository;
    this.cache = cache;
  }

  getVersion() {
    return this.cache.getVersion();
  }

  async getLanguages() {
    const configured = await this.repository.getLanguages();
    if (!configured.length) {
      return FALLBACK_LANGUAGES.map((code) => ({ code, name: code.toUpperCase() }));
    }

    return configured.map((item) => ({
      code: normalizeLanguage(item.code) || "en",
      name: item.name
    }));
  }

  resolveLanguage({ pathLang, queryLang, headerLang, acceptLanguage, defaultLang }) {
    const candidate =
      normalizeLanguage(pathLang) ||
      normalizeLanguage(queryLang) ||
      normalizeLanguage(headerLang) ||
      parseAcceptLanguage(acceptLanguage) ||
      normalizeLanguage(defaultLang) ||
      "en";

    return candidate;
  }

  async getResources() {
    return this.repository.getResources();
  }

  async getBundle(lang) {
    const dictionary = await this.getDictionary(lang);
    const bundle = {
      app: {},
      auth: {},
      forget: {},
      register: {}
    };

    for (const [key, value] of Object.entries(dictionary)) {
      if (key.startsWith("APP_")) {
        bundle.app[key.slice(4).toLowerCase()] = value;
        continue;
      }

      if (key.startsWith("AUTH_")) {
        bundle.auth[key.slice(5).toLowerCase()] = value;
        continue;
      }

      const forgetMatch = key.match(/^[A-Z]+_FORGET_(.+)$/);
      if (forgetMatch) {
        bundle.forget[forgetMatch[1].toLowerCase()] = value;
        continue;
      }

      const registerMatch = key.match(/^[A-Z]+_REGISTER_(.+)$/);
      if (registerMatch) {
        bundle.register[registerMatch[1].toLowerCase()] = value;
      }
    }

    return bundle;
  }

  async getDictionary(lang) {
    const normalizedLang = normalizeLanguage(lang) || "en";
    const version = this.cache.getVersion();
    const cacheKey = `dict:${normalizedLang}:${version}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const resources = await this.repository.getResources();
    const dictionary = {};

    for (const resource of resources) {
      dictionary[resource.key] = resolveTranslation(resource.translations, normalizedLang, resource.key);
    }

    this.cache.set(cacheKey, dictionary);
    return dictionary;
  }

  async saveResource({ key, culture, value, force, actor }) {
    const normalizedKey = (key || "").trim();
    if (!normalizedKey) {
      throw new Error("Key is required");
    }

    const normalizedCulture = normalizeLanguage(culture);
    if (!normalizedCulture) {
      throw new Error("Culture is required");
    }

    const resources = await this.repository.getResources();
    const exists = resources.some((item) => item.key === normalizedKey && Number(item.is_deleted) !== 1);

    if (exists && isProtectedKey(normalizedKey) && !force) {
      throw new Error("I18N_KEY_PROTECTED");
    }

    await this.repository.upsertResource({
      key: normalizedKey,
      culture: normalizedCulture,
      value: value ?? "",
      actor: actor || "system"
    });

    this.cache.invalidate();
  }

  async saveBatchResources({ lang, force, items, actor }) {
    const normalizedCulture = normalizeLanguage(lang);
    if (!normalizedCulture) {
      throw new Error("I18N_LANG_NOT_SUPPORTED");
    }

    if (!items || typeof items !== "object" || Array.isArray(items)) {
      throw new Error("ERR_INVALID_ARGUMENT");
    }

    const keys = Object.keys(items);
    let success = 0;
    for (const key of keys) {
      await this.saveResource({
        key,
        culture: normalizedCulture,
        value: items[key],
        force: Boolean(force),
        actor
      });
      success += 1;
    }

    return {
      processed: keys.length,
      success,
      version: `v${this.getVersion()}`
    };
  }

  async reloadCache() {
    this.cache.invalidate();
  }
}
