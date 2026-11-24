import { del, get, set } from 'idb-keyval';

/** Persistence lives behind this interface so cloud sync can slot in later. */
export interface StorageAdapter {
  load(): Promise<unknown | null>;
  save(data: unknown): Promise<void>;
  clear(): Promise<void>;
}

const KEY = 'mossling.save';

export class LocalStorageAdapter implements StorageAdapter {
  async load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as unknown) : null;
    } catch {
      return null;
    }
  }
  async save(data: unknown) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked: nothing more we can do */
    }
  }
  async clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}

/** IndexedDB via idb-keyval, falling back to localStorage when IDB is unavailable (private modes). */
export class IdbAdapter implements StorageAdapter {
  private fallback = new LocalStorageAdapter();
  private idbOk = typeof indexedDB !== 'undefined';

  async load() {
    if (this.idbOk) {
      try {
        const v = await get(KEY);
        if (v !== undefined) return v as unknown;
      } catch {
        this.idbOk = false;
      }
    }
    return this.fallback.load();
  }
  async save(data: unknown) {
    if (this.idbOk) {
      try {
        await set(KEY, data);
        return;
      } catch {
        this.idbOk = false;
      }
    }
    await this.fallback.save(data);
  }
  async clear() {
    try {
      await del(KEY);
    } catch {
      /* ignore */
    }
    await this.fallback.clear();
  }
}

export const storage: StorageAdapter = new IdbAdapter();
