import { get, set } from '~/cache';

const statusCache = new Map<string, { promise?: Promise<any>; error?: any }>();

export function primeCache<T>(key: string, fetcher: () => Promise<T>, { ttl }: { ttl: number }) {
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

export function useCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    { ttl, enabled = true }: { ttl: number; enabled: boolean }
) {
    if (!enabled) return;
    const cachedData = get(key) as T | undefined;
    if (cachedData !== undefined) {
        return cachedData;
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
