import { get, set } from '~/app/cache';

// A simple cache-first hook for data fetching that is compatible with React Suspense.
// It throws promises for loading states and errors for error states.

// We need a separate cache for tracking the status of fetches (promises and errors)
// to prevent re-fetching on every render when a fetch is in flight or has failed.
const statusCache = new Map<string, { promise?: Promise<any>; error?: any }>();

export function useCache<T>(key: string, fetcher: () => Promise<T>, { ttl }: { ttl: number }) {
    // 1. Try to get data from the main data cache
    const cachedData = get(key) as T | undefined;
    if (cachedData !== undefined) {
        return cachedData;
    }

    // 2. Check the status of the fetch for this key
    const status = statusCache.get(key);

    // If there was an error, throw it to the nearest Error Boundary
    if (status?.error) {
        throw status.error;
    }

    // If a fetch is already in flight, throw the promise to Suspense
    if (status?.promise) {
        throw status.promise;
    }

    // 3. If no data and no fetch in flight, start a new fetch
    const promise = (async () => {
        try {
            const data = await fetcher();
            // On success, cache the data and clear the status cache for this key
            set({ key, value: data, ttl });
            statusCache.delete(key);
            return data;
        } catch (error) {
            // On error, store the error in the status cache and re-throw it
            statusCache.set(key, { error });
            throw error;
        }
    })();

    // Store the promise in the status cache and throw it for Suspense to catch
    statusCache.set(key, { promise });
    throw promise;
}
