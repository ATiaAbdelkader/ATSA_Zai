/**
 * Safe localStorage wrapper — see H8 in the code review.
 *
 * Direct `localStorage.getItem` / `setItem` calls throw in several real
 * environments: Safari private-browsing mode, embedded iframes with storage
 * disabled, browsers with cookies disabled, and any environment where
 * `window.localStorage` is undefined (SSR, some test runners).
 *
 * Several places in this codebase call `localStorage` inside React `useState`
 * initializers — meaning a thrown exception white-screens the entire app on
 * first render. This wrapper swallows those exceptions and returns null /
 * false instead, so callers can fall back gracefully.
 */

function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    // Probe by writing+removing a no-op key.
    const probe = '__atsa_storage_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const available = isStorageAvailable();

export const safeStorage = {
  available,

  get(key: string): string | null {
    if (!available) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /** Parse JSON stored under `key`. Returns `fallback` on any error. */
  getJSON<T>(key: string, fallback: T): T {
    if (!available) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },

  set(key: string, value: string): boolean {
    if (!available) return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  setJSON(key: string, value: unknown): boolean {
    if (!available) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): void {
    if (!available) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* no-op */
    }
  },
};
