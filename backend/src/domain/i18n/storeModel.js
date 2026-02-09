import { FALLBACK_LANGUAGES } from "./constants.js";

export function createDefaultStore() {
  const now = new Date().toISOString();
  return {
    modelVersion: 1,
    languages: [
      { code: "ja", name: "日本語" },
      { code: "en", name: "English" },
      { code: "zh", name: "中文" }
    ],
    resources: [
      {
        id: "seed-msg-welcome",
        key: "MSG_WELCOME",
        translations: {
          ja: "ようこそ",
          en: "Welcome",
          zh: "欢迎"
        },
        created_at: now,
        updated_at: now,
        created_by: "system",
        updated_by: "system",
        is_deleted: 0
      }
    ],
    metadata: {
      storageType: "object-store",
      fallbackLanguages: [...FALLBACK_LANGUAGES],
      updatedAt: new Date().toISOString()
    }
  };
}

export function normalizeStore(raw, storageType = "object-store") {
  const base = createDefaultStore();
  const safe = raw && typeof raw === "object" ? raw : {};

  const languages = Array.isArray(safe.languages) ? safe.languages : base.languages;
  const resources = (Array.isArray(safe.resources) ? safe.resources : base.resources).map((item) => {
    const now = new Date().toISOString();
    return {
      id: item.id || `res-${item.key || Math.random().toString(36).slice(2)}`,
      key: item.key || "",
      translations: item.translations && typeof item.translations === "object" ? item.translations : {},
      created_at: item.created_at || now,
      updated_at: item.updated_at || now,
      created_by: item.created_by || "system",
      updated_by: item.updated_by || "system",
      is_deleted: Number.isInteger(item.is_deleted) ? item.is_deleted : 0
    };
  });

  return {
    modelVersion: Number.isFinite(safe.modelVersion) ? safe.modelVersion : base.modelVersion,
    languages,
    resources,
    metadata: {
      ...(base.metadata || {}),
      ...(safe.metadata && typeof safe.metadata === "object" ? safe.metadata : {}),
      storageType,
      updatedAt: new Date().toISOString()
    }
  };
}
