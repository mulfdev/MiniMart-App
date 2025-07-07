import { ErrorBoundary } from '~/components/ErrorBoundary';
import { NftCard } from '~/components/NftCard';
import { Sparkles } from 'lucide-react';
import { fetchAllOrders } from '~/loaders';
import { useCache, primeCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';
import type { Nft } from '@minimart/types';

export function clientLoader() {
    primeCache(cacheKeys.homepageOrders, () => fetchAllOrders(), {
        ttl: 120_000,
    });
    return null;
}

export function Fallback() {
    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                {/* Loading State */}
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                    </div>
                    <p className="text-zinc-400 font-medium">Loading all orders...</p>
                </div>
            </main>
        </div>
    );
}

function AllOrdersContent() {
    const nfts = useCache(cacheKeys.homepageOrders, () => fetchAllOrders(), {
        ttl: 120_000,
    });

    return (
        <div className="max-w-7xl mx-auto">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        All Orders
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Browse all the NFTs listed for sale across the platform.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {nfts &&
                        nfts.map((nft: Nft, index: number) => (
                            <div
                                key={`${nft.contract.address}+${nft.tokenId}`}
                                className="animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <NftCard nft={nft} variant="view"/>
                            </div>
                        ))}
                </div>
                {/* Empty State */}
                {nfts && nfts.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-16 h-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-8 h-8 text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium">
                            No orders found.
                        </p>
                    </div>
                ) : null}
            </main>
        </div>
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