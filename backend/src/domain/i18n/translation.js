import { FALLBACK_LANGUAGES, PROTECTED_KEY_PREFIXES } from "./constants.js";

export function isProtectedKey(key) {
  if (!key || typeof key !== "string") {
    return false;
  }

  return PROTECTED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function resolveTranslation(translations, requestedLang, key) {
  if (!translations || typeof translations !== "object") {
    return key;
  }

  if (requestedLang && translations[requestedLang]) {
    return translations[requestedLang];
  }

  for (const fallback of FALLBACK_LANGUAGES) {
    if (fallback !== requestedLang && translations[fallback]) {
      return translations[fallback];
    }
  }

  const firstAvailable = Object.values(translations).find((value) => Boolean(value));
  return firstAvailable || key;
}

