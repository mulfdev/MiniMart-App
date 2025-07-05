// A simple, generic, in-memory TTL cache.
// It stores promises to prevent request waterfalls and ensures that for a given key,
// the data-fetching function is only executed once within the specified TTL.

interface CacheEntry<T> {
    promise: Promise<T>;
    expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function getFromCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = cache.get(key);

    if (existing && now < existing.expiry) {
        return existing.promise;
    }

    const fetchData = async (): Promise<T> => {
        try {
            const data = await fetcher();
            return data;
        } catch (error) {
            // If the fetcher fails, remove the promise from the cache to allow for retries.
            // This check prevents a race condition where a new, valid promise is overwritten.
            if (cache.get(key)?.promise === promise) {
                cache.delete(key);
            }
            throw error;
        }
    };

    const promise = fetchData();
    cache.set(key, {
        promise,
        expiry: now + ttl,
    });

    return promise;
}

export function invalidateCache(key: string) {
    cache.delete(key);
}

