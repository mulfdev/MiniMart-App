import type { Nft, OrderListed } from '@minimart/types';
import { ALCHEMY_API_KEY, API_URL } from '~/root';
export type ListNftLoaderData = Nft | null;

interface TokenWithOrderData {
    nft: Nft;
    orderData: OrderListed;
}

export async function fetchNft(
    contract: string,
    tokenId: string,
    orderInfo: boolean
): Promise<TokenWithOrderData | null> {
    if (!contract || !tokenId) {
        console.error('Contract address or token ID missing in params.');
        return null;
    }

    try {
        const url = new URL(`${API_URL}/single-token`);

        url.searchParams.set('nftContract', contract);
        url.searchParams.set('tokenId', tokenId);

        if (orderInfo) {
            url.searchParams.set('orderInfo', 'true');
        }

        const res = await fetch(url);
        const data = (await res.json()) as TokenWithOrderData;
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch NFT metadata:', error);
        return null;
    }
}

export async function fetchNfts(address: string) {
    try {
        const url = new URL(`${API_URL}/user-inventory`);
        url.searchParams.set('address', address);

        const res = await fetch(url);
        const data = (await res.json()) as Nft[];
        return data;
    } catch (e) {
        throw new Error('Could not fetch NFTs');
    }
}

export async function fetchOrders(address: string) {
    try {
        const url = new URL(`${API_URL}/user-orders`);
        url.searchParams.set('address', address);

        const res = await fetch(url, { cache: 'no-store' });
        const data = (await res.json()) as Nft[];
        return data;
    } catch (e) {
        throw new Error('Could not fetch NFTs');
    }
}
