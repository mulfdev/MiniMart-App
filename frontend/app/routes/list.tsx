import { Suspense, useState } from 'react';
import { Link, useParams } from 'react-router';
import { type Address, parseEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { useWriteContract } from 'wagmi';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { AddOrderButton } from '~/components/AddOrderButton';
import { LoadingSpinner } from '~/components/LoadingSpinner';

import type { Route } from './+types/list';
import { miniMartAddr, nftAbi } from '~/utils';
import { config } from '~/root';

import { fetchNft } from '~/loaders';
import { Toast } from '~/components/Toast';
import { primeCache, useCache, cacheKeys } from '~/hooks/useCache';
import { Loader } from '~/components/Loader';

export function clientLoader({ params }: Route.LoaderArgs) {
    primeCache(
        cacheKeys.nft(params.contract, params.tokenId),
        () => fetchNft(params.contract, params.tokenId, false),
        { ttl: 120_000 }
    );
}
export function HydrateFallback() {
    return <Loader text="Loading NFT details..." />;
}

function ApproveButton({ nftContract, className }: { nftContract: Address; className?: string }) {
    const { writeContractAsync, isPending, error } = useWriteContract();

    async function handleApprove() {
        try {
            const hash = await writeContractAsync({
                address: nftContract,
                abi: nftAbi,
                functionName: 'setApprovalForAll',
                args: [miniMartAddr, true],
            });
            if (hash) {
                await waitForTransactionReceipt(config, { hash });
            }
        } catch (err) {
            console.error('Approval transaction failed:', err);
        }
    }

    return (
        <div className="w-full">
            <button onClick={handleApprove} disabled={isPending} className={className}>
                {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner />
                        <span>Approving...</span>
                    </div>
                ) : (
                    'Approve Marketplace'
                )}
            </button>
            {error && (
                <p className="text-red-400 text-sm mt-2 text-center">
                    Approval failed. Please try again.
                </p>
            )}
        </div>
    );
}

function SingleToken() {
    const params = useParams();
    const { address } = useAccount();

    const { data: isApproved, isLoading: isCheckingApproval } = useReadContract({
        abi: nftAbi,
        address: params.contract as `0x${string}`,
        functionName: 'isApprovedForAll',
        args: [address!!, miniMartAddr],
        query: {
            enabled: !!params.contract && !!address,
        },
    });

    const [price, setPrice] = useState<string>('');
    const [status, setStatus] = useState<'checking' | 'success'>('checking');
    const [errorInfo, setErrorInfo] = useState({ isError: false, message: '' });

    const defaultButtonStyles =
        'w-full sm:w-64 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-out shadow-lg disabled:opacity-50 disabled:cursor-wait';

    const token = useCache(
        cacheKeys.nft(params.contract!, params.tokenId!),
        () => fetchNft(params.contract!, params.tokenId!, false),
        { ttl: 120_000, enabled: !!params.tokenId || !!params.contract }
    );

    if (!token?.nft) {
        return (
            <div className="max-w-7xl mx-auto">
                <main className="mx-auto px-4 py-8 sm:py-16">
                    <div className="text-center py-20 space-y-4">
                        <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-white">NFT Not Found</h1>
                        <p className="text-zinc-400 font-medium">Could not load NFT details.</p>
                        <Link
                            to={`/user/${address || ''}`}
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
        <main className="mx-auto px-4 py-8 sm:py-16">
            <div className="max-w-2xl mx-auto bg-zinc-900/70 rounded-3xl p-3 md:p-6 border border-zinc-800/50 backdrop-blur-sm shadow-xl">
                <div className="grid grid-cols-1 items-center mb-6 gap-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">List Your NFT</h1>

                    <div className="flex flex-col md:flex-row gap-5">
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
                                <span className="font-mono text-zinc-300">{token.nft.tokenId}</span>
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
                </div>
                {status !== 'success' && (
                    <>
                        {isCheckingApproval ? (
                            <div className="flex items-center justify-center p-8">
                                <LoadingSpinner />
                                <span className="ml-2 text-zinc-400">
                                    Checking approval status...
                                </span>
                            </div>
                        ) : isApproved ? (
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="price"
                                        className="block text-zinc-300 font-semibold text-lg mb-2"
                                    >
                                        Set Listing Price (ETH)
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
                                <AddOrderButton
                                    price={parseEther(price)}
                                    nftContract={token.nft.contract.address}
                                    tokenId={token.nft.tokenId}
                                    onSuccess={() => {
                                        setStatus('success');
                                    }}
                                    onError={(err: Error) =>
                                        setErrorInfo({
                                            isError: true,
                                            message: err.message.split('.')[0],
                                        })
                                    }
                                    className={defaultButtonStyles}
                                >
                                    List NFT
                                </AddOrderButton>
                            </div>
                        ) : (
                            <div className="space-y-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Approve Marketplace
                                    </h3>
                                    <p className="text-zinc-400">
                                        To list this NFT, you first need to grant the MiniMart
                                        marketplace permission to transfer it on your behalf.
                                    </p>
                                </div>
                                <ApproveButton
                                    nftContract={token.nft.contract.address as Address}
                                    className={defaultButtonStyles}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
            {status === 'success' ? <Toast variant="success" message="Success" /> : null}
            {errorInfo.isError ? <Toast variant="error" message={errorInfo.message} /> : null}
        </main>
    );
}

export default function ListNft() {
    return (
        <Suspense fallback={<HydrateFallback />}>
            <SingleToken />
        </Suspense>
    );
}
