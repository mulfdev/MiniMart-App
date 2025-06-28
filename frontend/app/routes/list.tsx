import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { type Address, parseEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import type { Nft } from '@minimart/types';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';

import { Navigation } from '~/components/Navigation';
import { AddOrderButton } from '~/components/AddOrderButton';
export async function clientLoader({ params }: Route.ClientLoaderArgs): Promise<ListNftLoaderData> {
    const { contract, tokenId } = params;
    return fetchNft(contract, tokenId);
}
import type { Route } from './+types/list';
import { miniMartAddr, nftAbi } from '~/utils';

import { fetchNft } from '~/loaders';

export function HydrateFallback() {
    const backgroundStyle = {
        backgroundColor: '#0a0a0a',
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, hsla(220, 100%, 50%, 0.05), transparent), url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgb(255,255,255,0.02)"%3E%3Cpath d="M0 .5H31.5V32"/%3E%3C/svg%3E')`,
    };
    return (
        <div className="min-h-screen" style={backgroundStyle}>
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                    </div>
                    <p className="text-zinc-400 font-medium">Loading NFT details...</p>
                </div>
            </main>
        </div>
    );
}

function ApproveButton({ nftContract, className }: { nftContract: Address; className?: string }) {
    const { writeContractAsync, isPending, error } = useWriteContract();
    async function handleApprove() {
        try {
            await writeContractAsync({
                address: nftContract,
                abi: nftAbi,
                functionName: 'setApprovalForAll',
                args: [miniMartAddr, true],
            });
        } catch (err) {
            console.error('Approval transaction failed:', err);
        }
    }

    return (
        <div className="w-full">
            <button onClick={handleApprove} disabled={isPending} className={className}>
                {isPending ? 'Approving in Wallet...' : '1. Approve Marketplace'}
            </button>
            {error && (
                <p className="text-red-400 text-sm mt-2 text-center">
                    Approval failed. Please try again.
                </p>
            )}
        </div>
    );
}

export default function ListNft({ loaderData }: Route.ComponentProps) {
    const nft = loaderData;

    const { contract, tokenId } = useParams();

    const { address } = useAccount();
    if (!tokenId || !contract) {
        return <>Wrong info</>;
    }

    const isQueryEnabled = !!contract && !!address;

    const { data: isApproved } = useReadContract({
        abi: nftAbi,
        address: contract as `0x${string}`,
        functionName: 'isApprovedForAll',
        args: isQueryEnabled ? [address, miniMartAddr] : undefined,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const [price, setPrice] = useState<string>('');
    const [status, setStatus] = useState<'checking' | 'success'>('checking');
    const [errorInfo, setErrorInfo] = useState({ isError: false, message: '' });

    const backgroundStyle = {
        backgroundColor: '#0a0a0a',
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, hsla(220, 100%, 50%, 0.05), transparent), url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgb(255,255,255,0.02)"%3E%3Cpath d="M0 .5H31.5V32"/%3E%3C/svg%3E')`,
    };

    if (!nft) {
        return (
            <div className="min-h-screen" style={backgroundStyle}>
                <Navigation />
                <main className="container mx-auto px-4 py-8 sm:py-16">
                    <div className="text-center py-20 space-y-4">
                        <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-white">NFT Not Found</h1>
                        <p className="text-zinc-400 font-medium">Could not load NFT details.</p>
                        <Link
                            to={`/view/${address || ''}`}
                            className="text-blue-500 hover:underline inline-flex items-center mt-4"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" /> Go back to my collection
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const defaultButtonStyles =
        'w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-out shadow-lg disabled:opacity-50';

    return (
        <div className="min-h-screen" style={backgroundStyle}>
            <Navigation />
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="max-w-2xl mx-auto bg-zinc-900/70 rounded-3xl p-6 sm:p-10 border border-zinc-800/50 backdrop-blur-sm shadow-xl">
                    {status !== 'success' && (
                        <>
                            <div className="flex items-center mb-6">
                                <Link
                                    to={`/view/${address || ''}`}
                                    className="text-zinc-400 hover:text-zinc-200"
                                >
                                    <ChevronLeft className="w-6 h-6 mr-2 inline-block" />
                                </Link>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                                    List Your NFT
                                </h1>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 mb-8">
                                <div className="md:w-1/2 flex justify-center items-center p-4 bg-zinc-800 rounded-xl border border-zinc-700/50">
                                    <img
                                        src={
                                            nft.image.originalUrl ||
                                            nft.tokenUri ||
                                            '/placeholder.svg'
                                        }
                                        alt={nft.name || 'NFT Image'}
                                        className="max-w-full max-h-64 object-contain rounded-lg"
                                    />
                                </div>
                                <div className="md:w-1/2 space-y-4">
                                    <h2 className="text-2xl font-bold text-white">
                                        {nft.name || nft.contract.name} #{nft.tokenId}
                                    </h2>
                                    <p className="text-zinc-400 text-sm">
                                        Collection:{' '}
                                        <span className="font-mono text-zinc-300 break-all">
                                            {nft.contract.name}
                                        </span>
                                    </p>
                                    <p className="text-zinc-400 text-sm">
                                        Token ID:{' '}
                                        <span className="font-mono text-zinc-300">
                                            {nft.tokenId}
                                        </span>
                                    </p>
                                    {nft.description ? (
                                        <p className="text-zinc-300 text-base line-clamp-3">
                                            {nft.description}
                                        </p>
                                    ) : (
                                        <p className="text-zinc-500 text-base italic">
                                            No description available.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isApproved ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-center gap-2 p-3 bg-green-900/40 border border-green-700/60 rounded-lg text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        <p className="text-sm font-semibold text-green-300">
                                            Marketplace Approved!
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-zinc-300 font-semibold text-lg mb-2"
                                        >
                                            Step 2: Set Listing Price (ETH)
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="e.g., 0.05"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    {errorInfo.isError && (
                                        <div className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg text-center">
                                            {errorInfo.message}
                                        </div>
                                    )}
                                    <AddOrderButton
                                        price={parseEther(price)}
                                        nftContract={nft.contract.address}
                                        tokenId={nft.tokenId}
                                        onSuccess={() => setStatus('success')}
                                        onError={(err: Error) =>
                                            setErrorInfo({ isError: true, message: err.message })
                                        }
                                        className={defaultButtonStyles}
                                    >
                                        List NFT
                                    </AddOrderButton>
                                </div>
                            ) : (
                                <div className="space-y-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                                    <h3 className="text-lg font-semibold text-white text-center">
                                        Step 1 of 2: Grant Permission
                                    </h3>
                                    <p className="text-zinc-400 text-center text-sm">
                                        First, approve the marketplace to manage this NFT. This is a
                                        standard, one-time security step for this item.
                                    </p>
                                    <ApproveButton
                                        nftContract={nft.contract.address as Address}
                                        className={defaultButtonStyles}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-10 space-y-6">
                            <CheckCircle2 className="mx-auto w-20 h-20 text-green-400" />
                            <h2 className="text-3xl font-bold text-white">
                                NFT Listed Successfully!
                            </h2>
                            <p className="text-zinc-300 text-lg">
                                Your item is now live on the marketplace.
                            </p>
                            <Link
                                to={`/view/${address || ''}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                            >
                                View My Collection
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

