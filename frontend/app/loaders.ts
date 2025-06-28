import type { Nft } from '@minimart/types';
import { ALCHEMY_API_KEY } from '~/root';
import type { Route as ListRoute } from './routes/+types/list';

export type ListNftLoaderData = Nft | null;

export async function fetchNft(contract: string, tokenId: string): Promise<ListNftLoaderData> {
    if (!contract || !tokenId) {
        console.error('Contract address or token ID missing in params.');
        return null;
    }
    try {
        const res = await fetch(
            `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&tokenType=ERC721&refreshCache=false`
        );
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error fetching NFT metadata: ${res.status} - ${errorText}`);
            return null;
        }
        const data = await res.json();
        return data && data.contract && data.tokenId ? (data as Nft) : null;
    } catch (error) {
        console.error('Failed to fetch NFT metadata:', error);
        return null;
    }
}
