import { ErrorBoundary } from '~/components/ErrorBoundary';
import { fetchAllOrders } from '~/loaders';
import { useMemo, useState } from 'react';
import type { Nft, OrderListed } from '@minimart/types';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { Dropdown, type DropdownOption } from '~/components/Dropdown';
import { NftCard } from '~/components/NftCard';
import { useLoaderData } from 'react-router';
import { useSortedNfts } from '~/hooks/useSortedNfts';

export async function clientLoader() {
    const allOrders = await fetchAllOrders();
    return allOrders;
}

function AllOrdersContent() {
    const data = useLoaderData<typeof clientLoader>();
    const sortOptions: DropdownOption[] = [
        { value: 'listedAt_desc', label: 'Recently Listed' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ];

    const [currentSort, setCurrentSort] = useState<string>(sortOptions[0].value);
    const [currentFilter, setCurrentFilter] = useState<string>('all');

    const filterOptions: DropdownOption[] = useMemo(() => {
        if (!data?.nfts) return [];
        const collections = data.nfts.reduce(
            (acc, nft) => {
                const { address, name } = nft.nft.contract;
                if (!acc[address]) {
                    acc[address] = { value: address, label: name };
                }
                return acc;
            },
            {} as Record<string, DropdownOption>
        );
        return [{ value: 'all', label: 'All Collections' }, ...Object.values(collections)];
    }, [data]);

    const filteredNfts = useMemo(() => {
        if (!data?.nfts) return [];
        if (currentFilter === 'all') return data.nfts;
        return data.nfts.filter((nft) => nft.nft.contract.address === currentFilter);
    }, [data, currentFilter]);

    const sortedAndFilteredNfts = useSortedNfts(filteredNfts, currentSort);

    if (!data) {
        return <Loader text="Loading all orders..." />;
    }

    const handleSortChange = (newValue: string) => {
        setCurrentSort(newValue);
    };

    const handleFilterChange = (newValue: string) => {
        setCurrentFilter(newValue);
    };

    if (!data || data.nfts.length === 0) return <EmptyState message="No orders found." />;

    return (
        <Page
            title="All Orders"
            description="Browse all the NFTs listed for sale across the platform."
        >
            <>
                <div className="flex justify-end mb-8 gap-4">
                    <Dropdown
                        options={filterOptions}
                        currentValue={currentFilter}
                        onValueChange={handleFilterChange}
                        placeholder="Filter by Collection"
                    />
                    <Dropdown
                        options={sortOptions}
                        currentValue={currentSort}
                        onValueChange={handleSortChange}
                        placeholder="Sort by"
                    />
                </div>

                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center
                        gap-y-8 gap-x-4"
                >
                    {sortedAndFilteredNfts.map((nft) => (
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
