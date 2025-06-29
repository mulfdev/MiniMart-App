import { useLoaderData, Link } from 'react-router';
import { fetchNft } from '~/loaders';
import { useAccount } from 'wagmi';
import { queryClient } from '~/root';
import { ChevronLeft, ExternalLink, Shield, Hash, FileText, Fingerprint } from 'lucide-react';

export async function clientLoader({ params }: { params: { contract: string; tokenId: string } }) {
    const { contract, tokenId } = params;
    return queryClient.ensureQueryData({
        queryKey: ['nft', contract, tokenId],
        queryFn: () => fetchNft(contract, tokenId),
    });
}

export default function ViewToken() {
    const nft = useLoaderData<typeof clientLoader>();
    const { address } = useAccount();

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
        <div
            className="flex-grow flex flex-col lg:flex-row overflow-hidden lg:h-[calc(100vh-88px)]"
        >
            {/* Left side: Image with background effect */}
            <div className="lg:w-2/3 h-1/2 lg:h-full flex items-center justify-center relative">
                <div className="w-full h-full relative">
                    <div className="relative h-full bg-transparent">
                        <div className="absolute inset-0 md:overflow-hidden">
                            <img
                                src={nft.image.originalUrl || nft.tokenUri || '/placeholder.svg'}
                                alt=""
                                className="w-full h-full object-cover scale-110 blur-xl opacity-30"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img
                                src={nft.image.originalUrl || nft.tokenUri || '/placeholder.svg'}
                                className="max-w-full max-h-full object-contain transform transition-transform duration-700 ease-out drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: Details */}
            <div className="lg:w-1/3 overflow-y-scroll">
                <div className="mx-auto w-full px-8">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-blue-400 font-semibold mb-2">{nft.contract.name}</p>
                            <h1 className="text-4xl sm:text-5xl font-bold text-white">
                                {nft.name || `#${nft.tokenId}`}
                            </h1>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                {nft.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Properties */}
                        <div className="mb-8 col">
                            <h2 className="text-xl font-semibold text-white mb-4">Properties</h2>

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
                            <div className="mt-auto pt-3">
                                <button
                                    className="w-64 group flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 
                                             text-white font-semibold rounded-xl
                                             transform hover:scale-105 active:scale-95
                                             transition-all duration-200 ease-out
                                             shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                                >
                                    <span>Buy Now</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
