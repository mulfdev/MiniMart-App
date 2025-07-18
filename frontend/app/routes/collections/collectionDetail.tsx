import { ErrorBoundary } from '~/components/ErrorBoundary';
import { useState } from 'react';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { Dropdown, type DropdownOption } from '~/components/Dropdown';
import { NftCard } from '~/components/NftCard';
import { useLoaderData } from 'react-router';
import { useSortedNfts } from '~/hooks/useSortedNfts';

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
    const { nfts, collectionName } = useLoaderData<typeof clientLoader>();
    const displayCollectionName = collectionName || 'This Collection';
    const sortOptions: DropdownOption[] = [
        { value: 'listedAt_desc', label: 'Recently Listed' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ];

    const [currentSort, setCurrentSort] = useState<string>(sortOptions[0].value);
    const sortedNfts = useSortedNfts(nfts, currentSort);

    if (!nfts) {
        return <Loader text="Loading collection listings..." />;
    }

    const handleSortChange = (newValue: string) => {
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
                    <Dropdown
                        options={sortOptions}
                        currentValue={currentSort}
                        onValueChange={handleSortChange}
                        placeholder="Sort by"
                    />
                </div>

                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center
                        gap-8"
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
