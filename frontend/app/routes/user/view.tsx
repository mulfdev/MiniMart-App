import { ErrorBoundary } from '~/components/ErrorBoundary';
import type { Route } from './+types/view';
import { fetchNfts } from '~/loaders';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { useLoaderData, Link, Await } from 'react-router';
import { useState, Suspense } from 'react';
import type { Nft } from '@minimart/types';

export function clientLoader({ params }: Route.ClientLoaderArgs) {
    return {
        nfts: fetchNfts(params.address), // Promise returned without await
    };
}

// Enhanced loading component with floating elements
// Skeleton component matching TokenTableRow structure
function TokenTableRowSkeleton() {
    return (
        <div
            className="relative flex items-center space-x-4 p-4 rounded-2xl border
                border-cyan-300/15 animate-pulse"
        >
            {/* Image skeleton with icon placeholder */}
            <div
                className="h-20 w-20 rounded-lg bg-gradient-to-br from-cyan-900/40 to-blue-900/40
                    flex-shrink-0 animate-shimmer bg-[length:400%_100%]
                    [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                    flex items-center justify-center relative overflow-hidden"
            >
                {/* Animated NFT icon placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-cyan-400/30 animate-pulse"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" opacity="0.8" />
                        <path d="M2 17L12 22L22 17" opacity="0.6" />
                        <path d="M2 12L12 17L22 12" opacity="0.4" />
                    </svg>
                </div>
                {/* Floating sparkles */}
                <div
                    className="absolute top-2 right-2 w-1 h-1 bg-cyan-300/50 rounded-full
                        animate-ping"
                    style={{ animationDelay: '0s' }}
                ></div>
                <div
                    className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-blue-300/40 rounded-full
                        animate-ping"
                    style={{ animationDelay: '0.8s' }}
                ></div>
                <div
                    className="absolute top-3 left-2 w-0.5 h-0.5 bg-cyan-400/60 rounded-full
                        animate-ping"
                    style={{ animationDelay: '1.2s' }}
                ></div>
            </div>

            {/* Content skeleton */}
            <div className="flex-grow min-w-0 space-y-2">
                <div
                    className="h-5 bg-gradient-to-r from-cyan-800/50 to-blue-800/50 rounded
                        animate-shimmer bg-[length:400%_100%]
                        [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                        w-3/4"
                ></div>
                <div
                    className="h-4 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded
                        animate-shimmer bg-[length:400%_100%]
                        [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                        w-1/2"
                ></div>
            </div>

            {/* Metadata skeleton - hidden on mobile */}
            <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
                <div className="w-40 space-y-1">
                    <div
                        className="h-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded
                            animate-shimmer bg-[length:400%_100%]
                            [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                            w-16"
                    ></div>
                    <div
                        className="h-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded
                            animate-shimmer bg-[length:400%_100%]
                            [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                            w-24"
                    ></div>
                </div>
                <div className="w-32 space-y-1">
                    <div
                        className="h-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded
                            animate-shimmer bg-[length:400%_100%]
                            [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                            w-12"
                    ></div>
                    <div
                        className="h-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded
                            animate-shimmer bg-[length:400%_100%]
                            [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                            w-20"
                    ></div>
                </div>
            </div>

            {/* Button skeleton */}
            <div
                className="px-4 py-2 h-8 w-16 bg-gradient-to-r from-cyan-900/30 to-blue-900/30
                    rounded-lg animate-shimmer bg-[length:400%_100%]
                    [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)]
                    flex-shrink-0"
            ></div>
        </div>
    );
}

// Skeleton loader showing multiple rows
function SkeletonLoader() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
                <TokenTableRowSkeleton key={index} />
            ))}
        </div>
    );
}

function TokenTableRow({ nft }: { nft: Nft }) {
    const [isVisible, setIsVisible] = useState(true);

    const handleImageError = () => {
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="group relative flex items-center space-x-4 p-4 rounded-2xl transition-all
                duration-300
                [background:linear-gradient(145deg,rgba(8,19,35,0.35),rgba(18,26,46,0.1))]
                hover:[background:linear-gradient(145deg,rgba(8,19,35,0.55),rgba(18,26,46,0.3))]
                border border-cyan-300/25 shadow-[0_8px_14px_rgba(0,200,255,.06)]"
        >
            <img
                src={nft.image.thumbnailUrl || '/placeholder.svg'}
                alt={nft.name || `Token ${nft.tokenId}`}
                onError={handleImageError}
                className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-grow min-w-0">
                <div
                    className="text-lg font-bold text-cyan-100/90 group-hover:text-cyan-50 truncate"
                >
                    {nft.name || `Token #${nft.tokenId}`}
                </div>
                <div className="text-sm text-cyan-400/70 truncate">{nft.contract.name}</div>
            </div>

            <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
                <div className="flex items-baseline text-sm text-gray-400 w-40" title={nft.tokenId}>
                    <span className="font-semibold text-gray-300 mr-1.5 whitespace-nowrap">
                        Token ID:
                    </span>
                    <span className="truncate">{nft.tokenId}</span>
                </div>
                <div
                    className="flex items-baseline text-sm text-gray-400 w-32"
                    title={nft.tokenType}
                >
                    <span className="font-semibold text-gray-300 mr-1.5">Type:</span>
                    <span className="truncate">{nft.tokenType}</span>
                </div>
            </div>

            <Link
                to={`/list/${nft.contract.address}/${nft.tokenId}`}
                className="px-4 py-2 text-sm font-semibold text-cyan-100 bg-cyan-900/50 border
                    border-cyan-300/30 rounded-lg hover:bg-cyan-800/70 transition-colors
                    flex-shrink-0"
            >
                List
            </Link>
        </div>
    );
}

function ViewNftsContent() {
    const { nfts } = useLoaderData<typeof clientLoader>();

    return (
        <Suspense fallback={<SkeletonLoader />}>
            <Await resolve={nfts}>
                {(resolvedNfts) => {
                    if (!resolvedNfts || !resolvedNfts.nfts || resolvedNfts.nfts.length === 0) {
                        return <EmptyState message="No listings found." />;
                    }

                    return (
                        <div className="space-y-4">
                            {resolvedNfts.nfts.map((nft) => (
                                <TokenTableRow
                                    key={`${nft.contract.address}-${nft.tokenId}`}
                                    nft={nft}
                                />
                            ))}
                        </div>
                    );
                }}
            </Await>
        </Suspense>
    );
}

export default function ViewNfts() {
    return (
        <Page
            title="Your Collection"
            description="Here are the NFTs you own. Select any NFT to create a listing."
        >
            <ErrorBoundary>
                <ViewNftsContent />
            </ErrorBoundary>
        </Page>
    );
}
