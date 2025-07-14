import { ErrorBoundary } from '~/components/ErrorBoundary';
import { fetchAllOrders } from '~/loaders';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Nft, OrderListed } from '@minimart/types';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { SortDropdown, type SortOption, type SortValue } from '~/components/SortDropdown';
import { NftCard } from '~/components/NftCard';
import { useLoaderData } from 'react-router';
import { useOnClickOutside } from '~/hooks/useOnClickOutside';
import { Check, ChevronsUpDown } from 'lucide-react';

export async function clientLoader() {
    const allOrders = await fetchAllOrders();
    return allOrders;
}

type FilterOption = {
    value: string;
    label: string;
};
type FilterValue = FilterOption['value'];

type FilterDropdownProps = {
    options: FilterOption[];
    currentFilter: string;
    onFilterChange: (value: FilterValue) => void;
};

function FilterDropdown({ options, currentFilter, onFilterChange }: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(dropdownRef, () => setIsOpen(false));

    const selectedLabel =
        options.find((opt) => opt.value === currentFilter)?.label || 'Filter by...';

    const handleSelect = (value: FilterValue) => {
        onFilterChange(value);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left z-20">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex w-full justify-center items-center gap-x-2 rounded-lg
                    bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-sm ring-1
                    ring-inset ring-zinc-700/80 hover:bg-zinc-700/90 transition-colors duration-150"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {selectedLabel}
                <ChevronsUpDown className="-mr-1 h-5 w-5 text-zinc-400" aria-hidden="true" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md
                        bg-zinc-800/90 backdrop-blur-md shadow-lg ring-1 ring-zinc-700
                        focus:outline-none animate-in fade-in-0 zoom-in-95"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`${
                                    currentFilter === option.value
                                        ? 'bg-blue-600/30 text-white'
                                        : 'text-zinc-200'
                                } group flex w-full items-center px-4 py-2 text-sm hover:bg-zinc-700
                                transition-colors duration-100`}
                                role="menuitem"
                            >
                                <span className="flex-grow text-left">{option.label}</span>
                                {currentFilter === option.value && (
                                    <Check className="h-4 w-4 text-blue-400" aria-hidden="true" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AllOrdersContent() {
    const data = useLoaderData<typeof clientLoader>();
    const sortOptions: SortOption[] = [
        { value: 'listedAt_desc', label: 'Recently Listed' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ] as const;

    const [currentSort, setCurrentSort] = useState<SortValue>(sortOptions[0].value);
    const [filteredNfts, setFilteredNfts] = useState<{ nft: Nft; orderInfo: OrderListed }[]>([]);
    const [currentFilter, setCurrentFilter] = useState<FilterValue>('all');

    const filterOptions: FilterOption[] = useMemo(() => {
        if (!data?.nfts) return [];
        const collections = data.nfts.reduce(
            (acc, nft) => {
                const { address, name } = nft.nft.contract;
                if (!acc[address]) {
                    acc[address] = { value: address, label: name };
                }
                return acc;
            },
            {} as Record<string, FilterOption>
        );
        return [{ value: 'all', label: 'All Collections' }, ...Object.values(collections)];
    }, [data]);

    useEffect(() => {
        if (data?.nfts) {
            const filtered =
                currentFilter === 'all'
                    ? data.nfts
                    : data.nfts.filter((nft) => nft.nft.contract.address === currentFilter);

            const sorted = [...filtered].sort((a, b) => {
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
            setFilteredNfts(sorted);
        }
    }, [data, currentSort, currentFilter]);

    if (!data) {
        return <Loader text="Loading all orders..." />;
    }

    const handleSortChange = (newValue: SortValue) => {
        setCurrentSort(newValue);
    };

    const handleFilterChange = (newValue: FilterValue) => {
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
                    <FilterDropdown
                        options={filterOptions}
                        currentFilter={currentFilter}
                        onFilterChange={handleFilterChange}
                    />
                    <SortDropdown
                        options={sortOptions}
                        currentSort={currentSort}
                        onSortChange={handleSortChange}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-22">
                    {filteredNfts.map((nft) => (
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
