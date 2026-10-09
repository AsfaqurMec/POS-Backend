/**
 * High-performance In-Memory Cache with TTL & Pattern Invalidation
 * Dramatically speeds up repeat read operations across remote database connections.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Get value from cache if present and not expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with TTL in milliseconds.
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidate exact key.
   */
  del(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching prefix / pattern.
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Flush entire cache.
   */
  flush(): void {
    this.store.clear();
  }

  /**
   * Fetch from cache or compute and cache.
   */
  async getOrSet<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    this.set(key, fresh, ttlMs);
    return fresh;
  }
}

export const appCache = new MemoryCache();
