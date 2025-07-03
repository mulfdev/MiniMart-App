import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { type Address, parseEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';

import { AddOrderButton } from '~/components/AddOrderButton';

import type { Route } from './+types/list';
import { miniMartAddr, nftAbi } from '~/utils';

import { fetchNft } from '~/loaders';
import { queryClient } from '~/root';
import { useQuery } from '@tanstack/react-query';
import { Toast } from '~/components/Toast';

export function clientLoader({ params }: Route.LoaderArgs) {
    const { contract, tokenId } = params;
    queryClient.prefetchQuery({
        queryKey: ['nft', contract, tokenId],
        queryFn: () => fetchNft(contract, tokenId),
    });
    return null;
}
export function HydrateFallback() {
    return (
        <div className="min-h-screen">
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

export default function ListNft() {
    const params = useParams();
    const { data: token, isLoading } = useQuery({
        queryKey: ['nft', params.contract, params.tokenId],
        queryFn: () => fetchNft(params.contract!, params.tokenId!),
        enabled: !!params.contract && !!params.tokenId,
    });

    const { address } = useAccount();
    if (!params.tokenId || !params.contract) {
        return <>Wrong info</>;
    }

    const isQueryEnabled = !!params.contract && !!address;

    const { data: isApproved } = useReadContract({
        abi: nftAbi,
        address: params.contract as `0x${string}`,
        functionName: 'isApprovedForAll',
        args: isQueryEnabled ? [address, miniMartAddr] : undefined,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const [price, setPrice] = useState<string>('');
    const [status, setStatus] = useState<'checking' | 'success'>('checking');
    const [errorInfo, setErrorInfo] = useState({ isError: false, message: '' });

    if (isLoading) return <HydrateFallback />;

    if (!token?.nft) {
        return (
            <div className="max-w-7xl mx-auto">
                <main className="mx-auto px-4 py-8 sm:py-16">
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
        <main className="mx-auto px-4 py-8 sm:py-16">
            <div className="max-w-2xl mx-auto bg-zinc-900/70 rounded-3xl p-3 md:p-6 border border-zinc-800/50 backdrop-blur-sm shadow-xl">
                {status !== 'success' && (
                    <>
                        <div className="flex items-center mb-6">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">
                                List Your NFT
                            </h1>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="md:w-1/2 flex justify-center items-center p-4 bg-zinc-800 rounded-xl border border-zinc-700/50">
                                <img
                                    src={
                                        token.nft.image.originalUrl ||
                                        token.nft.tokenUri ||
                                        '/placeholder.svg'
                                    }
                                    alt={token.nft.name || 'NFT Image'}
                                    className="max-w-full max-h-64 object-contain rounded-lg"
                                />
                            </div>
                            <div className="md:w-1/2 space-y-4">
                                <h2 className="text-2xl font-bold text-white">
                                    {token.nft.name || token.nft.contract.name} #{token.nft.tokenId}
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    Collection:{' '}
                                    <span className="font-mono text-zinc-300 break-all">
                                        {token.nft.contract.name}
                                    </span>
                                </p>
                                <p className="text-zinc-400 text-sm">
                                    Token ID:{' '}
                                    <span className="font-mono text-zinc-300">
                                        {token.nft.tokenId}
                                    </span>
                                </p>
                                {token.nft.description ? (
                                    <p className="text-zinc-300 text-base line-clamp-3">
                                        {token.nft.description}
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
                                <div>
                                    <label
                                        htmlFor="price"
                                        className="block text-zinc-300 font-semibold text-lg mb-2"
                                    >
                                        Step 2: Set Listing Price (ETH)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        id="price"
                                        value={price}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setPrice('');
                                                return;
                                            }
                                            // Ensure only numbers and a single decimal point are allowed
                                            let dotCount = 0;
                                            const validChars = '0123456789.';
                                            let isValid = true;

                                            for (const char of val) {
                                                if (char === '.') {
                                                    dotCount++;
                                                }
                                                if (!validChars.includes(char) || dotCount > 1) {
                                                    isValid = false;
                                                    break;
                                                }
                                            }

                                            if (isValid) {
                                                setPrice(val);
                                            }
                                        }}
                                        placeholder="e.g., 0.05"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                {price && !isNaN(parseFloat(price)) && parseFloat(price) > 0 ? (
                                    <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <p className="text-zinc-400">Marketplace Fee (3%)</p>
                                            <p className="text-zinc-300 font-mono">
                                                {(parseFloat(price) * 0.03).toFixed(6)} ETH
                                            </p>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <p className="text-zinc-300">You will receive</p>
                                            <p className="text-white font-mono">
                                                {(parseFloat(price) * 0.97).toFixed(6)} ETH
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                                {errorInfo.isError && (
                                    <div className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg text-center">
                                        {errorInfo.message}
                                    </div>
                                )}
                                <AddOrderButton
                                    price={parseEther(price)}
                                    nftContract={token.nft.contract.address}
                                    tokenId={token.nft.tokenId}
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
                                    nftContract={token.nft.contract.address as Address}
                                    className={defaultButtonStyles}
                                />
                            </div>
                        )}
                    </>
                )}

                {status === 'success' && (
                    <div className="text-center py-10 space-y-6">
                        <CheckCircle2 className="mx-auto w-20 h-20 text-green-400" />
                        <h2 className="text-3xl font-bold text-white">NFT Listed Successfully!</h2>
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
            {status === 'success' ? <Toast variant="success" message="Success" /> : null}
            {errorInfo.message ? <Toast variant="error" message={errorInfo.message} /> : null}
        </main>
    );
}
