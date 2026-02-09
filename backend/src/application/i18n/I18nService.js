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

    if (isProtectedKey(normalizedKey) && !force) {
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

  async reloadCache() {
    this.cache.invalidate();
  }
}
