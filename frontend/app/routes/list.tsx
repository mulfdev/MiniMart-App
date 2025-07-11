import { Suspense, useState } from 'react';
import { Link, useLoaderData, useParams } from 'react-router';
import { type Address, parseEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { useWriteContract } from 'wagmi';
import {
    ChevronLeft,
    AlertCircle,
    Shield,
    Hash,
    FileText,
    Fingerprint,
    Tag,
    ExternalLink,
} from 'lucide-react';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { AddOrderButton } from '~/components/AddOrderButton';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import type { Route } from './+types/list';
import { miniMartAddr, nftAbi } from '~/utils';
import { wagmiConfig } from '~/config';
import { fetchAllOrders, fetchNft, fetchNfts, fetchUserOrders } from '~/loaders';
import { Toast } from '~/components/Toast';
import { Loader } from '~/components/Loader';

export async function clientLoader({ params }: Route.LoaderArgs) {
    const nft = await fetchNft(params.contract, params.tokenId, false);
    return nft;
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
                await waitForTransactionReceipt(wagmiConfig, { hash });
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
    const { data: isApproved, isLoading: isCheckingApproval } = useReadContract({
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

    if (!token?.nft) {
        return (
            <div className="flex-grow flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="text-center space-y-4">
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

    const defaultButtonStyles =
        'w-full group flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-out shadow-lg hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
            {/* Left side: Image with background effect */}
            <div className="lg:w-2/3 h-1/2 lg:h-[calc(100svh-64px)] flex items-center justify-center relative">
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
            <div className="lg:w-1/3">
                <div className="mx-auto w-full px-8">
                    <div className="flex flex-col pt-8 pb-20 sm:py-0">
                        {/* Header */}
                        <div className="my-6">
                            <p className="text-blue-400 text-3xl font-semibold mb-2">
                                {token.nft.contract.name}
                            </p>
                            <h1 className="text-2xl font-bold text-white">
                                {token.nft.name || `#${token.nft.tokenId}`}
                            </h1>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                {token.nft.description || 'No description available.'}
                            </p>
                        </div>

                        {status !== 'success' && (
                            <div className="mt-auto">
                                {isCheckingApproval ? (
                                    <div className="flex items-center justify-center p-8">
                                        <LoadingSpinner />
                                        <span className="ml-2 text-zinc-400">
                                            Checking approval status...
                                        </span>
                                    </div>
                                ) : isApproved ? (
                                    <div className="space-y-6">
                                        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-6">
                                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                                <Tag className="w-5 h-5 text-zinc-500" />
                                                Set Listing Price
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        htmlFor="price"
                                                        className="block text-zinc-300 font-medium text-sm mb-2"
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
                                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>

                                                {price &&
                                                !isNaN(Number.parseFloat(price)) &&
                                                Number.parseFloat(price) > 0 ? (
                                                    <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <p className="text-zinc-400">
                                                                Fee (3%)
                                                            </p>
                                                            <p className="text-zinc-300 font-mono">
                                                                {(
                                                                    Number.parseFloat(price) * 0.03
                                                                ).toFixed(6)}{' '}
                                                                ETH
                                                            </p>
                                                        </div>
                                                        <div className="flex justify-between font-semibold">
                                                            <p className="text-zinc-300">
                                                                You receive
                                                            </p>
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
                                    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-6">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                Approve Marketplace
                                            </h3>
                                            <p className="text-zinc-400">
                                                To list this NFT, you first need to grant the
                                                MiniMart marketplace permission to transfer it on
                                                your behalf.
                                            </p>
                                        </div>
                                        <ApproveButton
                                            nftContract={token.nft.contract.address as Address}
                                            className={defaultButtonStyles}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Properties */}
                        <div className="flex flex-col mt-6">
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
                                                                9
                                                            )}...${prop.value.slice(-9)}`}</span>
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
            </div>
            {status === 'success' ? (
                <Toast variant="success" message="NFT Listed Successfully!" />
            ) : null}
            {errorInfo.isError ? <Toast variant="error" message={errorInfo.message} /> : null}
        </div>
    );
}

export default function ListNft() {
    return (
        <Suspense fallback={<Loader text="Loading NFT details..." />}>
            <SingleToken />
        </Suspense>
    );
}
