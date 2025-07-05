// A simple, generic, in-memory TTL cache.
// It stores promises to prevent request waterfalls and ensures that for a given key,
// the data-fetching function is only executed once within the specified TTL.

interface CacheEntry<T> {
    value: T;
    expiry: number;
}

const Cache = new Map<string, CacheEntry<unknown> | undefined>();

export function get<T>(key: string) {
    const entry = Cache.get(key);
    if (typeof entry === 'undefined') return undefined;

    if (entry.expiry < Date.now()) {
        Cache.delete(key);
        return undefined;
    }
    return entry.value as T;
}

export function set({ key, value, ttl }: { key: string; value: unknown; ttl: number }) {
    Cache.set(key, {
        value: value,
        expiry: Date.now() + ttl,
    });
}

export function remove(key: string) {
    Cache.delete(key);
}
