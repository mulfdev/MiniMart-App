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
