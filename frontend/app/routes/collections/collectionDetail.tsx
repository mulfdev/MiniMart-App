import { ErrorBoundary } from '~/components/ErrorBoundary';
import { useEffect, useState } from 'react';
import type { Nft, OrderListed } from '@minimart/types';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { SortDropdown, type SortOption, type SortValue } from '~/components/SortDropdown';
import { NftCard } from '~/components/NftCard';
import { useLoaderData, useParams } from 'react-router';

export async function clientLoader({ params }: { params: Record<string, string | undefined> }) {
    const { contractAddress } = params;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${backendUrl}/collections/${contractAddress}`);

    if (!res.ok) {
        throw new Error('Failed to load collection listings');
    }

    const { nfts, collectionName } = await res.json();
    return { nfts, contractAddress, collectionName };
}

function CollectionListingsContent() {
    const { nfts, contractAddress, collectionName } = useLoaderData<typeof clientLoader>();
    const displayCollectionName = collectionName || 'This Collection';
    const sortOptions: SortOption[] = [
        { value: 'listedAt_desc', label: 'Recently Listed' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ] as const;

    const [currentSort, setCurrentSort] = useState<SortValue>(sortOptions[0].value);
    const [sortedNfts, setSortedNfts] = useState<{ nft: Nft; orderInfo: OrderListed }[]>([]);

    useEffect(() => {
        if (nfts) {
            const sorted = [...nfts].sort((a, b) => {
                switch (currentSort) {
                    case 'price_asc':
                        return BigInt(a.orderInfo.price) > BigInt(b.orderInfo.price) ? 1 : -1;
                    case 'price_desc':
                        return BigInt(b.orderInfo.price) > BigInt(a.orderInfo.price) ? 1 : -1;
                    case 'listedAt_desc':
                    default:
                        return b.orderInfo.blockTimestamp - a.orderInfo.blockTimestamp;
                }
            });
            setSortedNfts(sorted);
        }
    }, [nfts, currentSort]);

    if (!nfts) {
        return <Loader text="Loading collection listings..." />;
    }

    const handleSortChange = (newValue: SortValue) => {
        setCurrentSort(newValue);
    };

    if (nfts.length === 0)
        return (
            <EmptyState
                message={`No active listings found for this collection (${displayCollectionName}).`}
            />
        );

    return (
        <Page
            title={`Listings for ${collectionName}`}
            description={`Browse all the NFTs listed for sale from ${collectionName}.`}
        >
            <>
                <div className="flex justify-end mb-8 gap-4">
                    <SortDropdown
                        options={sortOptions}
                        currentSort={currentSort}
                        onSortChange={handleSortChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-22">
                    {sortedNfts.map((nft) => (
                        <div key={`${nft.nft.contract.address}+${nft.nft.tokenId}`}>
                            <NftCard nft={nft.nft} orderInfo={nft.orderInfo} variant="view" />
                        </div>
                    ))}
                </div>
            </>
        </Page>
    );
}

export default function CollectionListingsPage() {
    return (
        <ErrorBoundary>
            <CollectionListingsContent />
        </ErrorBoundary>
    );
}
