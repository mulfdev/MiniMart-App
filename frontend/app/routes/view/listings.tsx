import type { Route } from '../+types/view';
import { fetchUserOrders } from '~/loaders';
import { Sparkles } from 'lucide-react';
import { NftCard } from '~/components/NftCard';
import { useParams } from 'react-router';
import { primeCache, useCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';

export function clientLoader({ params }: Route.LoaderArgs) {
    const { address } = params;
    console.log(address);

    primeCache(cacheKeys.listings(address), () => fetchUserOrders(address), { ttl: 120_000 });
}

export function HydrateFallback() {
    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                {/* Loading State */}
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                    </div>
                    <p className="text-zinc-400 font-medium">Loading your listings</p>
                </div>
            </main>
        </div>
    );
}

function Listings() {
    const params = useParams();
    const nfts = useCache(cacheKeys.listings(params.address!), () => fetchUserOrders(params.address!), {
        ttl: 120_000,
        enabled: !!params.address,
    });

    if (nfts && nfts.length === 0) {
        return (
            <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">No NFTs found in your collection</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {nfts &&
                nfts.map((nft, index) => (
                    <div
                        key={`${nft.contract.address}+${nft.tokenId}`}
                        className="animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <NftCard nft={nft} variant="remove" />
                    </div>
                ))}
        </div>
    );
}

export default function () {
    return (
        <div className="max-w-7xl mx-auto">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Your Listings
                    </h1>
                    <Suspense fallback={<HydrateFallback />}>
                        <Listings />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
