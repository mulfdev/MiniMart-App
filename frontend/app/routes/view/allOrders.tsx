import { ErrorBoundary } from '~/components/ErrorBoundary';
import { fetchAllOrders } from '~/loaders';
import { Suspense, useState } from 'react';
import type { Nft, OrderListed } from '@minimart/types';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { SortDropdown, type SortOption, type SortValue } from '~/components/SortDropdown';
import { parseUnits } from 'viem';
import { NftCard } from '~/components/NftCard';
import { useLoaderData } from 'react-router';

export async function clientLoader() {
    const allOrders = await fetchAllOrders();
    return allOrders;
}

function AllOrdersContent() {
    const data = useLoaderData<typeof clientLoader>();
    const sortOptions: SortOption[] = [
        { value: 'listedAt_desc', label: 'Recently Listed' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ] as const;

    const [currentSort, setCurrentSort] = useState<SortValue>(sortOptions[0].value);

    const [sortedNfts, setSortedNfts] = useState<{ nft: Nft; orderInfo: OrderListed }[]>();

    if (!data) {
        return <Loader text="Loading all orders..." />;
    }

    const handleSortChange = (newValue: SortValue) => {
        setCurrentSort(newValue);

        // switch (newValue) {
        //     case 'listedAt_desc':
        //         const listedAt = data.sort(
        //             (a, b) => b.orderInfo.blockTimestamp - a.orderInfo.blockTimestamp
        //         );
        //         setSortedNfts(() => listedAt);
        //         break;
        //     case 'price_asc':
        //         console.log('got asc');
        //         const price_asc = data.sort(
        //             (a, b) => parseUnits(b.orderInfo.price, 18) - parseUnits(a.orderInfo.price, 18)
        //         );
        //         setSortedNfts(price_asc);
        //         break;
        //     case 'price_desc':
        //         console.log('got desc');
        //         break;
        // }
    };

    if (!data || data.nfts.length === 0) return <EmptyState message="No orders found." />;

    return (
        <Page
            title="All Orders"
            description="Browse all the NFTs listed for sale across the platform."
        >
            <>
                <div className="flex justify-end mb-8">
                    <SortDropdown
                        options={sortOptions}
                        currentSort={currentSort}
                        onSortChange={handleSortChange}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-22">
                    {data.nfts.map((nft) => (
                        <div key={`${nft.nft.contract.address}+${nft.nft.tokenId}`}>
                            <NftCard nft={nft.nft} orderInfo={nft.orderInfo} variant="view" />
                        </div>
                    ))}
                </div>
            </>
        </Page>
    );
}

export default function AllOrders() {
    return (
        <ErrorBoundary>
            <AllOrdersContent />
        </ErrorBoundary>
    );
}
