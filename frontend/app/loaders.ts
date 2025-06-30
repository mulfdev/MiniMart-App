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

export async function fetchNfts(address: string) {
    if (address.length !== 42 && !address.startsWith('0x'))
        return Promise.reject(new Error('Incorrect address'));

    try {
        const res = await fetch(
            `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=100`
        );

        if (!res.ok) throw new Error('Could not fetch NFTs');

        const data = await res.json();

        if (!data.ownedNfts || data.ownedNfts.length === 0) {
            return [];
        }

        const nfts = data.ownedNfts as Nft[];

        const noSpamNfts = nfts.filter((nft) => !nft.contract.isSpam);
        console.log('spam check \n', noSpamNfts);

        const erc721s = noSpamNfts.filter((nft) => nft.tokenType === 'ERC721') ?? [];

        console.log('first 721 check\n', erc721s);

        const erc721sWithImgs =
            erc721s.filter(
                (nft) =>
                    nft.tokenUri !== null || nft.tokenUri !== '' || nft.image.originalUrl !== null
            ) ?? [];

        console.log('with image check\n', erc721sWithImgs);

        return erc721sWithImgs ?? [];
    } catch (e) {
        throw new Error('Could not fetch NFTs');
    }
}
