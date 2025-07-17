import { ErrorBoundary } from '~/components/ErrorBoundary';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Nft, OrderListed } from '@minimart/types';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { SortDropdown, type SortOption, type SortValue } from '~/components/SortDropdown';
import { NftCard } from '~/components/NftCard';
import { useLoaderData } from 'react-router';
import { json, LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ params }: LoaderFunctionArgs) {
    const { contractAddress } = params;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${backendUrl}/collections/${contractAddress}`);

    if (!res.ok) {
        throw new Response('Failed to load collection listings', { status: res.status });
    }

    const { nfts } = await res.json();
    return json({ nfts, contractAddress });
}

function CollectionListingsContent() {
    const { nfts, contractAddress } = useLoaderData<typeof loader>();
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
                message={`No active listings found for this collection (${contractAddress}).`}
            />
        );

    return (
        <Page
            title={`Listings for ${contractAddress}`}
            description={`Browse all the NFTs listed for sale from collection ${contractAddress}.`}
        >
            <>
                <div className="flex justify-end mb-8 gap-4">
                    <SortDropdown
                        options={sortOptions}
                        currentSort={currentSort}
                        onSortChange={handleSortChange}
                    />
                </div>

                <div
                    className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start
                        items-center gap-8"
                >
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
