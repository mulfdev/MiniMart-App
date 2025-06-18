import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router'; // Corrected import for web
import { type Address, parseEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import type { Nft } from 'types';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';

import { Navigation } from '~/components/Navigation';
import { AddOrderButton } from '~/components/AddOrderButton';
import { ApproveButton } from '~/components/ApproveButton'; // Import the new component
import { ALCHEMY_API_KEY } from '~/root';
import type { Route } from './+types/list';

// --- START: Added for Approval Flow ---
const erc721AbiForApproval = [
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'getApproved',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;
const miniMartAddr = '0xd33530ACe9929Bf34197f2E0bED60e7c4170e791' as `0x${string}`;
// --- END: Added for Approval Flow ---

export type ListNftLoaderData = Nft | null;

// Your clientLoader remains untouched
export async function clientLoader({ params }: Route.ClientLoaderArgs): Promise<ListNftLoaderData> {
    const { contract, tokenId } = params;
    if (!contract || !tokenId) {
        console.error('Contract address or token ID missing in params.');
        return null;
    }
    try {
        const res = await fetch(
            `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&tokenType=ERC721&refreshCache=false`
        );
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error fetching NFT metadata: ${res.status} - ${errorText}`);
            return null;
        }
        const data = await res.json();
        return data && data.contract && data.tokenId ? (data as Nft) : null;
    } catch (error) {
        console.error('Failed to fetch NFT metadata:', error);
        return null;
    }
}

// Your HydrateFallback remains untouched
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

export default function ListNft({ loaderData }: Route.ComponentProps) {
    const nft = loaderData;
    const { address } = useAccount();

    const [price, setPrice] = useState<string>('');
    // --- START: State updated for multi-step flow ---
    const [status, setStatus] = useState<
        'checking' | 'needs_approval' | 'ready_to_list' | 'success'
    >('checking');
    const [errorInfo, setErrorInfo] = useState({ isError: false, message: '' });
    // --- END: State updated for multi-step flow ---

    // --- START: Logic for Approval Flow ---
    const {
        data: approvedAddress,
        refetch: refetchApproval,
        isLoading: isCheckingApproval,
    } = useReadContract({
        address: nft?.contract.address as Address,
        abi: erc721AbiForApproval,
        functionName: 'getApproved',
        args: [BigInt(nft?.tokenId ?? '0')],
        query: { enabled: !!nft },
    });

    useEffect(() => {
        if (isCheckingApproval || !nft) return;
        const isApproved = approvedAddress?.toLowerCase() === miniMartAddr.toLowerCase();
        setStatus(isApproved ? 'ready_to_list' : 'needs_approval');
    }, [approvedAddress, isCheckingApproval, nft]);

    const handleApprovalSuccess = () => {
        setStatus('checking');
        setErrorInfo({ isError: false, message: '' });
        setTimeout(() => refetchApproval(), 3000);
    };
    // --- END: Logic for Approval Flow ---

    const backgroundStyle = {
        backgroundColor: '#0a0a0a',
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, hsla(220, 100%, 50%, 0.05), transparent), url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgb(255,255,255,0.02)"%3E%3Cpath d="M0 .5H31.5V32"/%3E%3C/svg%3E')`,
    };
    const defaultButtonStyles =
        'w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-out shadow-lg disabled:opacity-50';

    if (!nft) {
        // Your existing NFT not found logic is kept
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

    return (
        <div className="min-h-screen" style={backgroundStyle}>
            <Navigation />
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="max-w-2xl mx-auto bg-zinc-900/70 rounded-3xl p-6 sm:p-10 border border-zinc-800/50 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center mb-6">
                        <Link
                            to={`/view/${address || ''}`}
                            className="text-zinc-400 hover:text-zinc-200"
                        >
                            <ChevronLeft className="w-6 h-6 mr-2 inline-block" />
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">List Your NFT</h1>
                    </div>

                    {status !== 'success' && (
                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            {/* Your NFT info display is kept */}
                            <div className="md:w-1/2 flex justify-center items-center p-4 bg-zinc-800 rounded-xl border border-zinc-700/50">
                                <img
                                    src={
                                        nft.image.originalUrl || nft.tokenUri || '/placeholder.svg'
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
                                    <span className="font-mono text-zinc-300">{nft.tokenId}</span>
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
                    )}

                    {/* --- START: Renders UI based on the current step --- */}
                    {status === 'checking' && (
                        <div className="text-center py-10">
                            <p className="text-zinc-400 animate-pulse">
                                Checking for marketplace approval...
                            </p>
                        </div>
                    )}

                    {status === 'needs_approval' && (
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
                                tokenId={BigInt(nft.tokenId)}
                                onApprovalSuccess={handleApprovalSuccess}
                                className={defaultButtonStyles}
                            />
                        </div>
                    )}

                    {status === 'ready_to_list' && (
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
                                price={price ? parseEther(price) : 0n}
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
                    {/* --- END: Renders UI based on the current step --- */}
                </div>
            </main>
        </div>
    );
}
