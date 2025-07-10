import { ErrorBoundary } from '~/components/ErrorBoundary';
import { fetchAllOrders } from '~/loaders';
import { useCache, primeCache, cacheKeys } from '~/hooks/useCache';
import { Suspense, useState } from 'react';
import type { Nft, OrderListed } from '@minimart/types';
import { Loader } from '~/components/Loader';
import { Page, NftGrid } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { SortDropdown, type SortOption, type SortValue } from '~/components/SortDropdown';
import { parseUnits } from 'viem';

export function clientLoader() {
    primeCache(cacheKeys.homepageOrders, () => fetchAllOrders(), {
        ttl: 120_000,
    });
    return null;
}

export function Fallback() {
    return <Loader text="Loading all orders..." />;
}

function AllOrdersContent() {
    const sortOptions: SortOption[] = [
        { value: 'listedAt_desc', label: 'Recently Listed' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ] as const;

    const [currentSort, setCurrentSort] = useState<SortValue>(sortOptions[0].value);

    const nfts = useCache(cacheKeys.homepageOrders, () => fetchAllOrders(), {
        ttl: 120_000,
    });

    const [sortedNfts, setSortedNfts] = useState<{ nft: Nft; orderInfo: OrderListed }[]>();

    if (!nfts) {
        return <Loader text="Loading all orders..." />;
    }

    const handleSortChange = (newValue: SortValue) => {
        setCurrentSort(newValue);

        switch (newValue) {
            case 'listedAt_desc':
                const listedAt = nfts.sort(
                    (a, b) => b.orderInfo.blockTimestamp - a.orderInfo.blockTimestamp
                );
                setSortedNfts(() => listedAt);
                break;
            case 'price_asc':
                console.log('got asc');
                const price_asc = nfts.sort(
                    (a, b) => parseUnits(b.orderInfo.price, 18) - parseUnits(a.orderInfo.price, 18)
                );
                setSortedNfts(price_asc);
                break;
            case 'price_desc':
                console.log('got desc');
                break;
        }
    };

    return (
        <Page
            title="All Orders"
            description="Browse all the NFTs listed for sale across the platform."
        >
            {nfts.length > 0 ? (
                <>
                    <div className="flex justify-end mb-8">
                        <SortDropdown
                            options={sortOptions}
                            currentSort={currentSort}
                            onSortChange={handleSortChange}
                        />
                    </div>
                    <NftGrid nfts={sortedNfts || nfts} variant="view" />
                </>
            ) : (
                <EmptyState message="No orders found." />
            )}
        </Page>
    );
}

export default function AllOrders() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
                <AllOrdersContent />
            </Suspense>
        </ErrorBoundary>
    );
}
