import { useParams, Link } from 'react-router';
import type { Route } from './+types/token';
import { fetchNft } from '~/loaders';
import { API_URL } from '~/root';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Shield, Hash, FileText, Fingerprint } from 'lucide-react';
import { useSimulateMinimartFulfillOrder, useWriteMinimartFulfillOrder } from 'src/generated';
import { CACHE_KEYS, miniMartAddr } from '~/utils';
import { Toast } from '~/components/Toast';
import { cacheKeys, primeCache, useCache } from '~/hooks/useCache';
import { Suspense } from 'react';

export function clientLoader({ params }: Route.LoaderArgs) {
    primeCache(
        cacheKeys.nft(params.contract, params.tokenId),
        () => fetchNft(params.contract, params.tokenId, true),
        {
            ttl: 120_000,
        }
    );
    return null;
}

function HydrateFallback() {
    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                {/* Loading State */}
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                    </div>
                    <p className="text-zinc-400 font-medium">Loading Token Data...</p>
                </div>
            </main>
        </div>
    );
}

function Token() {
    const params = useParams();
    const token = useCache(
        cacheKeys.nft(params.contract!, params.tokenId!),
        () => fetchNft(params.contract!, params.tokenId!, true),
        {
            ttl: 120_000,
            enabled: !!params.contract || !!params.tokenId,
        }
    );
    const { writeContractAsync, isPending, isSuccess, isError } = useWriteMinimartFulfillOrder();
    const { data: fulfillOrderSim } = useSimulateMinimartFulfillOrder({
        address: miniMartAddr,
        args: [token?.orderData.orderId as `0x${string}`],
        value: token?.orderData?.price ? BigInt(token.orderData.price) : undefined,
        query: {
            enabled: !!token?.orderData?.orderId && !!token.orderData.price,
        },
    });

    if (!token?.nft) {
        return (
            <div className="mt-20 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">NFT not found</h1>
                    <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
                        Go back home
                    </Link>
                </div>
            </div>
        );
    }

    const properties = [
        {
            icon: Fingerprint,
            label: 'Contract Address',
            value: token.nft.contract.address,
            isAddress: true,
        },
        {
            icon: Hash,
            label: 'Token ID',
            value: token.nft.tokenId,
        },
        {
            icon: Shield,
            label: 'Token Standard',
            value: token.nft.contract.tokenType,
        },
        {
            icon: FileText,
            label: 'Symbol',
            value: token.nft.contract.symbol,
        },
    ];

    return (
        <div className="relative">
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)] lg:h-[calc(100vh-88px)]">
                {/* Left side: Image with background effect */}
                <div className="lg:w-2/3 h-1/2 lg:h-full flex items-center justify-center relative">
                    <div className="w-full h-full relative">
                        <div className="relative h-full bg-transparent">
                            <div className="absolute inset-0 md:overflow-hidden">
                                <img
                                    src={
                                        token.nft.image.originalUrl ||
                                        token.nft.tokenUri ||
                                        '/placeholder.svg'
                                    }
                                    alt=""
                                    className="w-full h-full object-cover scale-110 blur-xl opacity-30"
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>

                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <img
                                    src={
                                        token.nft.image.originalUrl ||
                                        token.nft.tokenUri ||
                                        '/placeholder.svg'
                                    }
                                    className="max-w-full max-h-full object-contain transform transition-transform duration-700 ease-out drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Details */}
                <div className="lg:w-1/3 overflow-y-scroll">
                    <div className="mx-auto w-full px-8">
                        <div className="flex flex-col h-full py-8 sm:py-0">
                            {/* Header */}
                            <div className="mb-6">
                                <p className="text-blue-400 text-3xl font-semibold mb-2">
                                    {token.nft.contract.name}
                                </p>
                                <h1 className="text-2xl font-bold text-white">
                                    {token.nft.name || `#${token.nft.tokenId}`}
                                </h1>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-3">
                                    Description
                                </h2>
                                <p className="text-zinc-400 leading-relaxed">
                                    {token.nft.description || 'No description available.'}
                                </p>
                            </div>

                            {/* Properties */}
                            <div className="flex flex-col">
                                <div className="order-last lg:order-first">
                                    <h2 className="text-xl font-semibold text-white mb-4">
                                        Properties
                                    </h2>
                                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                        {properties.map((prop) => (
                                            <div
                                                key={prop.label}
                                                className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <prop.icon className="w-5 h-5 text-zinc-500" />
                                                    <div>
                                                        <p className="text-sm text-zinc-400">
                                                            {prop.label}
                                                        </p>
                                                        {prop.isAddress ? (
                                                            <a
                                                                href={`https://basescan.org/address/${prop.value}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-mono text-sm text-zinc-300 break-all hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
                                                            >
                                                                <span>{`${prop.value.slice(
                                                                    0,
                                                                    6
                                                                )}...${prop.value.slice(-4)}`}</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            <p className="font-mono text-sm text-zinc-300 break-all">
                                                                {prop.value}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-auto py-4 order-first lg:order-last">
                                    <button
                                        className="w-full lg:w-64 group flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 
                                             text-white font-semibold rounded-xl
                                             transform hover:scale-105 active:scale-95
                                             transition-all duration-200 ease-out
                                             shadow-lg hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!fulfillOrderSim || isPending}
                                        onClick={async () => {
                                            if (!fulfillOrderSim) return;
                                            try {
                                                await writeContractAsync(fulfillOrderSim.request);
                                                fetch(
                                                    `${API_URL}/reset-cache?cacheKey=${CACHE_KEYS.frontpageOrders}`
                                                );
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }}
                                    >
                                        <span>Buy Now</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isSuccess ? <Toast variant="success" message="Your order was filled!" /> : null}
            {isError ? <Toast variant="error" message="Could not complete your order" /> : null}
        </div>
    );
}

export default function ViewToken() {
    return (
        <Suspense fallback={<HydrateFallback />}>
            <Token />
        </Suspense>
    );
}
