import type { Nft, OrderListed } from '@minimart/types';
import { API_URL } from '~/root';
export type ListNftLoaderData = Nft | null;

interface TokenWithOrderData {
    nft: Nft;
    orderData: OrderListed;
}

export async function fetchNft(contract: string, tokenId: string, orderInfo: boolean) {
    if (!contract || !tokenId) {
        throw new Error('Contract address or token ID missing in params.');
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
        return data;
    } catch (error) {
        console.error('Failed to fetch NFT metadata:', error);
        return null;
    }
}

export async function fetchNfts(address: string, reload: boolean = false) {
    try {
        const url = new URL(`${API_URL}/user-inventory`);
        url.searchParams.set('address', address);

        const res = await fetch(url, { cache: reload ? 'reload' : 'default' });
        const data = (await res.json()) as { nfts: Nft[] };
        return data;
    } catch (e) {
        return { nfts: [] } as { nfts: Nft[] };
    }
}

export async function fetchUserOrders(address: string, reload: boolean = false) {
    try {
        const url = new URL(`${API_URL}/user-orders`);
        url.searchParams.set('address', address);

        const res = await fetch(url, { cache: reload ? 'reload' : 'default' });
        const data = (await res.json()) as { nfts: Nft[] };
        return data;
    } catch (e) {
        throw new Error('Could not fetch NFTs');
    }
}

export async function fetchAllOrders() {
    try {
        const response = await fetch(`${API_URL}/all-orders`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data as {
            nfts: {
                nft: Nft;
                orderInfo: OrderListed;
            }[];
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { nfts: [], orderInfo: [] };
    }
}
