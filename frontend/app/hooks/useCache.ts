interface CacheEntry<T> {
    value: T;
    expiry: number;
}

const statusCache = new Map<string, { promise?: Promise<any>; error?: any }>();

const Cache = new Map<string, CacheEntry<unknown> | undefined>();

export const cacheKeys = {
    homepageOrders: 'homepageOrders',
    nft: (contract: string, tokenId: string) => `nft:${contract}:${tokenId}`,
    nfts: (address: string) => `nfts:${address}`,
    listings: (address: string) => `listings:${address}`,
} as const;

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

export function primeCache<T extends () => Promise<any>>(
    key: string,
    fetcher: T,
    { ttl }: { ttl: number }
) {
    if (get(key) !== undefined || statusCache.has(key)) {
        return;
    }

    const promise = (async () => {
        try {
            const data = await fetcher();
            set({ key, value: data, ttl });
            statusCache.delete(key);
            return data;
        } catch (error) {
            statusCache.set(key, { error });
            throw error;
        }
    })();

    statusCache.set(key, { promise });
}

export function useCache<T extends () => Promise<any>>(
    key: string,
    fetcher: T,
    { ttl, enabled = true }: { ttl: number; enabled?: boolean }
): Awaited<ReturnType<T>> | undefined {
    if (!enabled) return;
    const cachedData = get(key);
    if (cachedData !== undefined) {
        return cachedData as Awaited<ReturnType<T>>;
    }

    const status = statusCache.get(key);

    if (status?.error) {
        throw status.error;
    }

    if (status?.promise) {
        throw status.promise;
    }

    const promise = (async () => {
        try {
            const data = await fetcher();
            set({ key, value: data, ttl });
            statusCache.delete(key);
            return data;
        } catch (error) {
            statusCache.set(key, { error });
            throw error;
        }
    })();

    statusCache.set(key, { promise });
    throw promise;
}

