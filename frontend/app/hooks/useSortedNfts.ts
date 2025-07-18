import { useMemo } from 'react';
import type { Nft, OrderListed } from '@minimart/types';

type NftWithOrder = { nft: Nft; orderInfo: OrderListed };

export function useSortedNfts(nfts: NftWithOrder[] | undefined, sortValue: string) {
    const sortedNfts = useMemo(() => {
        if (!nfts) return [];
        return [...nfts].sort((a, b) => {
            switch (sortValue) {
                case 'price_asc':
                    return BigInt(a.orderInfo.price) > BigInt(b.orderInfo.price) ? 1 : -1;
                case 'price_desc':
                    return BigInt(b.orderInfo.price) > BigInt(a.orderInfo.price) ? 1 : -1;
                case 'listedAt_desc':
                default:
                    return b.orderInfo.blockTimestamp - a.orderInfo.blockTimestamp;
            }
        });
    }, [nfts, sortValue]);

    return sortedNfts;
}
