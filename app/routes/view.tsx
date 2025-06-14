import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Shield, Sparkles } from 'lucide-react';
import { Navigation } from '~/components/Navigation';

interface Nft {
    collection: string;
    contract: string;
    description: string;
    display_animation_url: string | null;
    display_image_url: string;
    identifier: string;
    image_url: string;
    is_disabled: boolean;
    is_nsfw: boolean;
    metadata_url: string;
    name: string;
    opensea_url: string;
    token_standard: string;
    updated_at: string; // ISO 8601 datetime string
}

const OPENSEA_API_KEY = import.meta.env.VITE_OPENSEA_API_KEY;

if (typeof OPENSEA_API_KEY !== 'string') {
    throw new Error('OPENSEA_API_KEY must be set');
}

async function fetchNfts() {
    const headers = new Headers();
    headers.set('x-api-key', OPENSEA_API_KEY);

    const res = await fetch(
        `https://api.opensea.io/api/v2/chain/base/account/0x75A6085Bbc25665B6891EA94475E6120897BA90b/nfts`,
        { headers }
    );
    const data = await res.json();
    const nfts = data.nfts as Nft[];

    const erc721s = nfts.filter((nft) => nft.token_standard === 'erc721');

    return erc721s;
}

const NFTCard = ({ nft }: { nft: Nft }) => {
    return (
        <div className="group relative">
            {/* Main Card Container with responsive heights */}
            <div
                className="relative bg-zinc-900 rounded-2xl overflow-hidden 
                        h-[520px] sm:h-[480px] flex flex-col
                        shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                        hover:shadow-[0_20px_60px_rgb(0,0,0,0.3)]
                        transform hover:-translate-y-2 
                        transition-all duration-500 ease-out
                        border border-zinc-800/50 hover:border-zinc-700/80"
            >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Enhanced Image Container with artistic background */}
                <div className="relative overflow-hidden h-[320px] sm:h-[240px] bg-zinc-800">
                    {/* Blurred background image for artistic effect */}
                    <div className="absolute inset-0">
                        <img
                            src={nft.display_image_url || '/placeholder.svg'}
                            alt=""
                            className="w-full h-full object-cover scale-110 blur-xl opacity-30
                                     transform group-hover:scale-125 group-hover:opacity-40
                                     transition-all duration-700 ease-out"
                        />
                        {/* Overlay to darken the background */}
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    {/* Subtle pattern overlay for texture */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0 0h100v100H0z" fill="none"/%3E%3Cpath d="M0 0l100 100M100 0L0 100" stroke="white" strokeWidth="0.5" opacity="0.3"/%3E%3C/svg%3E')`,
                        }}
                    />

                    {/* Main image with object-contain */}
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={nft.display_image_url || '/placeholder.svg'}
                            alt={nft.name}
                            className="max-w-full max-h-full object-contain
                                     transform group-hover:scale-105 
                                     transition-transform duration-700 ease-out
                                     filter group-hover:brightness-110 group-hover:contrast-110
                                     drop-shadow-2xl"
                        />
                    </div>

                    {/* Artistic light rays effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2">
                            <div className="absolute inset-0 bg-gradient-conic from-transparent via-white/5 to-transparent animate-spin-slow" />
                        </div>
                    </div>

                    {/* Shine effect sweep */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                    bg-gradient-to-r from-transparent via-white/10 to-transparent
                                    transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                                    transition-transform duration-1000 ease-out"
                    />

                    {/* Enhanced frame border */}
                    <div className="absolute inset-4 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Token standard badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <div
                            className="flex items-center gap-1 px-2 py-1 
                                      bg-black/70 backdrop-blur-sm rounded-full
                                      border border-white/20 shadow-lg"
                        >
                            <Shield className="w-3 h-3 text-blue-400" />
                            <span className="text-xs font-mono text-white/90 font-medium">
                                {nft.token_standard.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Container with enhanced styling */}
                <div className="p-4 sm:p-6 flex flex-col justify-between flex-1 relative">
                    {/* Decorative line with gradient */}
                    <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

                    {/* Top Text Section */}
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <h2
                                className="text-lg sm:text-xl font-bold text-white leading-tight
                         group-hover:text-blue-100 transition-colors duration-300
                         drop-shadow-sm"
                            >
                                {nft.name}
                            </h2>
                            <Sparkles
                                className="w-4 h-4 text-yellow-400/60 group-hover:text-yellow-400 
                               transition-all duration-300 flex-shrink-0 mt-1
                               group-hover:rotate-12 group-hover:scale-110"
                            />
                        </div>

                        {/* Enhanced description area */}
                        <div className="h-12 sm:h-16 overflow-hidden">
                            {nft.description ? (
                                <p
                                    className="text-zinc-400 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3
                           group-hover:text-zinc-300 transition-colors duration-300"
                                >
                                    {nft.description}
                                </p>
                            ) : (
                                <p className="text-zinc-500 text-sm italic">
                                    A unique digital collectible
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Footer */}
                    <div
                        className="mt-4 sm:mt-6 pt-3 sm:pt-4 
                                  border-t border-gradient-to-r from-zinc-800/50 via-zinc-700/80 to-zinc-800/50
                                  transition-colors duration-300"
                    >
                        <div className="flex justify-between items-center gap-2">
                            <a
                                href={nft.opensea_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/link flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
                                         bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 hover:from-zinc-700/80 hover:to-zinc-600/80
                                         border border-zinc-700/50 hover:border-zinc-600/80
                                         rounded-xl font-semibold text-xs sm:text-sm text-white
                                         transform hover:scale-105 active:scale-95
                                         transition-all duration-200 ease-out
                                         shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
                            >
                                <span className="hidden sm:inline">View on OpenSea</span>
                                <span className="sm:hidden">OpenSea</span>
                                <ExternalLink
                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5
                                                       transition-transform duration-200"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ViewNfts() {
    const {
        data: nfts,
        isLoading,
        error,
    } = useQuery({ queryKey: ['userNfts'], queryFn: fetchNfts });

    const backgroundStyle = {
        backgroundColor: '#0a0a0a',
        backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, hsla(220, 100%, 50%, 0.05), transparent),
            radial-gradient(ellipse 60% 80% at 80% 50%, hsla(280, 100%, 50%, 0.03), transparent),
            radial-gradient(ellipse 40% 60% at 20% 80%, hsla(300, 100%, 50%, 0.02), transparent),
            url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgb(255,255,255,0.02)"%3E%3Cpath d="M0 .5H31.5V32"/%3E%3C/svg%3E')
        `,
    };

    return (
        <div className="min-h-screen" style={backgroundStyle}>
            <Navigation />
            <main className="container mx-auto px-4 py-8 sm:py-16">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="relative">
                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 w-8 h-8 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                        </div>
                        <p className="text-zinc-400 font-medium">Loading your NFT collection...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 
                                      rounded-lg text-red-400 backdrop-blur-sm"
                        >
                            <span>Error fetching NFTs: {error.message}</span>
                        </div>
                    </div>
                )}

                {/* NFT Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {nfts &&
                        nfts.map((nft, index) => (
                            <div
                                key={nft.identifier}
                                className="animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <NFTCard nft={nft} />
                            </div>
                        ))}
                </div>

                {/* Empty State */}
                {nfts && nfts.length === 0 && (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-16 h-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-8 h-8 text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium">
                            No NFTs found in this collection
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
