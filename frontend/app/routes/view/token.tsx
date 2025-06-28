import { useLoaderData, Link } from 'react-router';
import type { Nft } from '@minimart/types';
import { fetchNft } from '~/loaders';
import { queryClient } from '~/root';
import { Navigation } from '~/components/Navigation';
import { ChevronLeft, ExternalLink, Shield, Hash, FileText, Fingerprint } from 'lucide-react';

export async function clientLoader({ params }: { params: { contract: string; tokenId: string } }) {
    const { contract, tokenId } = params;
    return queryClient.ensureQueryData({
        queryKey: ['nft', contract, tokenId],
        queryFn: () => fetchNft(contract, tokenId),
    });
}

const backgroundStyle = {
    backgroundColor: '#0a0a0a',
    backgroundImage: `
        radial-gradient(ellipse 80% 50% at 50% -20%, hsla(220, 100%, 50%, 0.05), transparent),
        radial-gradient(ellipse 60% 80% at 80% 50%, hsla(280, 100%, 50%, 0.03), transparent),
        radial-gradient(ellipse 40% 60% at 20% 80%, hsla(300, 100%, 50%, 0.02), transparent),
        url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgb(255,255,255,0.02)"%3E%3Cpath d="M0 .5H31.5V32"/%3E%3C/svg%3E')
    `,
};

export default function ViewToken() {
    const nft = useLoaderData<typeof clientLoader>();

    if (!nft) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
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
            value: nft.contract.address,
            isAddress: true,
        },
        {
            icon: Hash,
            label: 'Token ID',
            value: nft.tokenId,
        },
        {
            icon: Shield,
            label: 'Token Standard',
            value: nft.contract.tokenType,
        },
        {
            icon: FileText,
            label: 'Symbol',
            value: nft.contract.symbol,
        },
    ];

    return (
        <div className="min-h-screen" style={backgroundStyle}>
            <Navigation />
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-zinc-400 hover:text-white transition-colors duration-200 group"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                        Back to Listings
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Image Column */}
                    <div className="lg:col-span-2 animate-in fade-in slide-in-from-left-8 duration-500">
                        <div className="relative group aspect-square bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50 shadow-2xl shadow-black/20">
                            <img
                                src={nft.image.originalUrl || nft.tokenUri}
                                alt={nft.name || 'NFT Image'}
                                className="w-full h-full object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                            <div className="absolute inset-4 border-2 border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="lg:col-span-3 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="mb-6">
                                <p className="text-blue-400 font-semibold mb-2">
                                    {nft.contract.name}
                                </p>
                                <h1 className="text-4xl sm:text-5xl font-bold text-white">
                                    {nft.name || `#${nft.tokenId}`}
                                </h1>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-3">
                                    Description
                                </h2>
                                <p className="text-zinc-400 leading-relaxed">
                                    {nft.description || 'No description available.'}
                                </p>
                            </div>

                            {/* Properties */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Properties
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                            <span>{`${prop.value.slice(0, 6)}...${prop.value.slice(-4)}`}</span>
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
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

