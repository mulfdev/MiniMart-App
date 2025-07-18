import { useState } from 'react';
import { Link, useLoaderData, useParams } from 'react-router';
import { type Address, parseEther, type ReadContractErrorType } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { AddOrderButton } from '~/components/AddOrderButton';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import type { Route } from './+types/list';
import { miniMartAddr, nftAbi } from '~/utils';
import { wagmiConfig } from '~/config';
import { fetchAllOrders, fetchNft, fetchNfts, fetchUserOrders } from '~/loaders';
import { Toast } from '~/components/Toast';
import type { QueryObserverResult } from '@tanstack/react-query';
import { ChevronLeft, AlertCircle, Tag } from 'lucide-react';
import { TokenPageLayout } from '~/components/TokenPageLayout';
import { TokenProperties } from '~/components/TokenProperties';

export async function clientLoader({ params }: Route.LoaderArgs) {
    const nft = await fetchNft(params.contract, params.tokenId, false);
    return nft;
}

function ApproveButton({
    nftContract,
    className,
    onApprovalSuccess,
}: {
    nftContract: Address;
    className?: string;
    refetch: () => Promise<QueryObserverResult<boolean, ReadContractErrorType>>;
    onApprovalSuccess: () => void;
}) {
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
                onApprovalSuccess();
                await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 });
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
    const token = useLoaderData<typeof clientLoader>();
    const { address } = useAccount();
    const {
        data: isApproved,
        isLoading: isCheckingApproval,
        refetch,
        isRefetching,
    } = useReadContract({
        abi: nftAbi,
        address: params.contract as `0x${string}`,
        functionName: 'isApprovedForAll',
        args: [address!, miniMartAddr],
        query: {
            enabled: !!params.contract && !!address,
        },
    });

    const [price, setPrice] = useState<string>('');
    const [status, setStatus] = useState<'checking' | 'success'>('checking');
    const [errorInfo, setErrorInfo] = useState({ isError: false, message: '' });
    const [isApprovedOptimistic, setIsApprovedOptimistic] = useState(false);

    if (!token?.nft) {
        return (
            <div className="flex-grow flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="text-center space-y-4">
                    <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-white">NFT Not Found</h1>
                    <p className="text-zinc-400 font-medium">Could not load NFT details.</p>
                    <Link
                        to={`/user/${address || ''}`}
                        className="text-sky-500 hover:underline inline-flex items-center mt-4"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" /> Go back to my collection
                    </Link>
                </div>
            </div>
        );
    }

    const defaultButtonStyles =
        'w-full group flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-out shadow-lg hover:shadow-xl hover:shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <>
            <TokenPageLayout nft={token.nft}>
                {/* Header */}
                <div className="my-6">
                    <p className="text-sky-400 text-3xl font-semibold mb-2">
                        {token.nft.contract.name}
                    </p>
                    <h1 className="text-2xl font-bold text-white">
                        {token.nft.name || `#${token.nft.tokenId}`}
                    </h1>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                    <p
                        className="text-zinc-400 leading-relaxed wrap-anywhere
                                    overflow-y-scroll max-h-[200px]"
                    >
                        {token.nft.description || 'No description available.'}
                    </p>
                </div>

                {status !== 'success' && (
                    <div className="mt-auto">
                        {isCheckingApproval || isRefetching ? (
                            <div className="flex items-center justify-center p-8">
                                <LoadingSpinner />
                                <span className="ml-2 text-zinc-400">
                                    Checking approval status...
                                </span>
                            </div>
                        ) : isApproved || isApprovedOptimistic ? (
                            <div className="space-y-6">
                                <div
                                    className="bg-slate-900/70 border border-sky-800/80
                                                rounded-xl p-6"
                                >
                                    <h3
                                        className="text-xl font-semibold text-white mb-4
                                                    flex items-center gap-2"
                                    >
                                        <Tag className="w-5 h-5 text-zinc-500" />
                                        Set Listing Price
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="price"
                                                className="block text-zinc-300 font-medium
                                                            text-sm mb-2"
                                            >
                                                Price (ETH)
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
                                                        if (
                                                            !validChars.includes(char) ||
                                                            dotCount > 1
                                                        ) {
                                                            isValid = false;
                                                            break;
                                                        }
                                                    }
                                                    if (isValid) {
                                                        setPrice(val);
                                                    }
                                                }}
                                                placeholder="e.g., 0.05"
                                                className="w-full px-4 py-3 rounded-xl
                                                            bg-slate-800 border border-sky-700
                                                            text-white placeholder-zinc-500
                                                            focus:ring-2 focus:ring-sky-500
                                                            outline-none"
                                            />
                                        </div>

                                        {price &&
                                        !isNaN(Number.parseFloat(price)) &&
                                        Number.parseFloat(price) > 0 ? (
                                            <div
                                                className="p-4 bg-slate-800/50 border
                                                            border-sky-700 rounded-xl space-y-2
                                                            text-sm"
                                            >
                                                <div className="flex justify-between">
                                                    <p className="text-zinc-400">Fee (3%)</p>
                                                    <p className="text-zinc-300 font-mono">
                                                        {(
                                                            Number.parseFloat(price) * 0.03
                                                        ).toFixed(6)}{' '}
                                                        ETH
                                                    </p>
                                                </div>
                                                <div
                                                    className="flex justify-between
                                                                font-semibold"
                                                >
                                                    <p className="text-zinc-300">You receive</p>
                                                    <p className="text-white font-mono">
                                                        {(
                                                            Number.parseFloat(price) * 0.97
                                                        ).toFixed(6)}{' '}
                                                        ETH
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <AddOrderButton
                                    price={parseEther(price)}
                                    nftContract={token.nft.contract.address}
                                    tokenId={token.nft.tokenId}
                                    onSuccess={() => {
                                        setStatus('success');
                                        fetchNfts(address!, true);
                                        fetchUserOrders(address!, true);
                                        fetchAllOrders(true);
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
                            <div
                                className="bg-slate-900/70 border border-sky-800/80
                                            rounded-xl p-6"
                            >
                                <div className="text-center mb-6">
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
                                    refetch={refetch}
                                    onApprovalSuccess={() => {
                                        setIsApprovedOptimistic(true);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                <TokenProperties nft={token.nft} />
            </TokenPageLayout>
            {status === 'success' ? (
                <Toast variant="success" message="NFT Listed Successfully!" />
            ) : null}
            {errorInfo.isError ? <Toast variant="error" message={errorInfo.message} /> : null}
        </>
    );
}

export default function ListNft() {
    return <SingleToken />;
}
