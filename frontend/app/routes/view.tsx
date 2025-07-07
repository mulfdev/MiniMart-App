import { ErrorBoundary } from '~/components/ErrorBoundary';
import { NftCard } from '~/components/NftCard';
import { Sparkles } from 'lucide-react';
import type { Route } from './+types/view';
import { useAccount } from 'wagmi';
import { fetchNfts } from '~/loaders';
import { useCache, primeCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';

export function clientLoader({ params }: Route.ClientLoaderArgs) {
    primeCache(cacheKeys.nfts(params.address), () => fetchNfts(params.address), {
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
                    <p className="text-zinc-400 font-medium">Loading your NFT collection...</p>
                </div>
            </main>
        </div>
    );
}

function ViewNftsContent({ address }: { address: `0x${string}` }) {
    const nfts = useCache(cacheKeys.nfts(address), () => fetchNfts(address), {
        ttl: 120_000,
        enabled: !!address,
    });

    return (
        <div className="max-w-7xl mx-auto">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Your Collection
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Here are the NFTs you own. Select any NFT to create a listing.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {nfts &&
                        nfts.map((nft, index) => (
                            <div
                                key={`${nft.contract.address}+${nft.tokenId}`}
                                className="animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <NftCard nft={nft} />
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
                            No NFTs found in your collection
                        </p>
                    </div>
                ) : null}
            </main>
        </div>
    );
}

export default function ViewNfts() {
    const { address, isConnecting } = useAccount();

    if (isConnecting || !address) {
        return <Fallback />;
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
                <ViewNftsContent address={address} />
            </Suspense>
        </ErrorBoundary>
    );
}
