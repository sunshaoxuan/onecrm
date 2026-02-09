import { promises as fs } from "node:fs";
import path from "node:path";
import { createDefaultStore, normalizeStore } from "../../domain/i18n/storeModel.js";

async function ensureFile(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const store = createDefaultStore();
    await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
  }
}

export class FileI18nRepository {
  constructor({ filePath }) {
    this.filePath = filePath;
  }

  async readStore() {
    await ensureFile(this.filePath);
    const raw = await fs.readFile(this.filePath, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeStore(parsed, "file");
  }

  async writeStore(store) {
    await fs.writeFile(this.filePath, JSON.stringify(store, null, 2), "utf8");
  }

  async getLanguages() {
    const store = await this.readStore();
    return store.languages;
  }

  async getResources() {
    const store = await this.readStore();
    return store.resources;
  }

  async upsertResource({ key, culture, value, actor }) {
    const store = await this.readStore();
    const index = store.resources.findIndex((item) => item.key === key);
    const now = new Date().toISOString();

    if (index === -1) {
      store.resources.push({
        id: `res-${Math.random().toString(36).slice(2, 10)}`,
        key,
        translations: {
          [culture]: value
        },
        created_at: now,
        updated_at: now,
        created_by: actor || "system",
        updated_by: actor || "system",
        is_deleted: 0
      });
    } else {
      const current = store.resources[index];
      current.translations = {
        ...(current.translations || {}),
        [culture]: value
      };
      current.updated_at = now;
      current.updated_by = actor || "system";
      if (!current.created_at) {
        current.created_at = now;
      }
      if (!current.created_by) {
        current.created_by = actor || "system";
      }
      if (!Number.isInteger(current.is_deleted)) {
        current.is_deleted = 0;
      }
      store.resources[index] = current;
    }

    await this.writeStore(store);
  }
}
