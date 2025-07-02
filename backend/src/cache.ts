export const CACHE_KEYS = {
    frontpageOrders: 'frontpageOrders',
    orderData: 'orderData',
} as const;

export type CACHE_KEYS_TYPES = keyof typeof CACHE_KEYS;

export const localCache = new Map<CACHE_KEYS_TYPES, any>();

export function isValidCacheKey(key: string): key is CACHE_KEYS_TYPES {
    const isKey = Object.keys(CACHE_KEYS).includes(key);

    if (!isKey) return false;
    return true;
}
