"use strict";
/**
 * High-performance In-Memory Cache with TTL & Pattern Invalidation
 * Dramatically speeds up repeat read operations across remote database connections.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.appCache = void 0;
class MemoryCache {
    store = new Map();
    /**
     * Get value from cache if present and not expired.
     */
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.data;
    }
    /**
     * Set value in cache with TTL in milliseconds.
     */
    set(key, data, ttlMs) {
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlMs,
        });
    }
    /**
     * Invalidate exact key.
     */
    del(key) {
        this.store.delete(key);
    }
    /**
     * Invalidate all keys matching prefix / pattern.
     */
    invalidatePrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }
    /**
     * Flush entire cache.
     */
    flush() {
        this.store.clear();
    }
    /**
     * Fetch from cache or compute and cache.
     */
    async getOrSet(key, ttlMs, fetcher) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        const fresh = await fetcher();
        this.set(key, fresh, ttlMs);
        return fresh;
    }
}
exports.appCache = new MemoryCache();
