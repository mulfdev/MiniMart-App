import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/token';
import { fetchNft, fetchUserOrders } from '~/loaders';
import { Tag } from 'lucide-react';
import { wagmiConfig } from '~/config';

import { useWriteMinimartFulfillOrder } from 'src/generated';
import { miniMartAddr } from '~/utils';
import { Toast } from '~/components/Toast';
import minimartAbi from '~/minimartAbi';
import { useState } from 'react';
import { formatEther } from 'viem';
import { waitForTransactionReceipt, simulateContract } from 'wagmi/actions';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import { useAccount } from 'wagmi';
import { TokenPageLayout } from '~/components/TokenPageLayout';
import { TokenProperties } from '~/components/TokenProperties';

export async function clientLoader({ params }: Route.LoaderArgs) {
    const nft = await fetchNft(params.contract, params.tokenId, true);
    return nft;
}

function Token() {
    const token = useLoaderData<typeof clientLoader>();

    const { address } = useAccount();

    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [isPurchaseComplete, setIsPurchaseComplete] = useState(false);

    const { writeContractAsync, isPending } = useWriteMinimartFulfillOrder();

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

    const handlePurchase = async () => {
        setShowSuccessToast(false);
        setShowErrorToast(false);
        setIsPurchasing(true);

        try {
            if (!token?.orderData?.args.orderId || !token.orderData.args.price) {
                setShowErrorToast(true);
                return;
            }

            const { request } = await simulateContract(wagmiConfig, {
                address: miniMartAddr,
                abi: minimartAbi,
                functionName: 'fulfillOrder',
                args: [token.orderData.args.orderId as `0x${string}`],
                value: BigInt(token.orderData.args.price),
            });

            const hash = await writeContractAsync(request);
            if (hash) {
                const receipt = await waitForTransactionReceipt(wagmiConfig, {
                    hash,
                    confirmations: 3,
                });
                if (receipt.status === 'success') {
                    setShowSuccessToast(true);
                    setIsPurchaseComplete(true);
                    fetchUserOrders(address!);
                } else {
                    setShowErrorToast(true);
                }
            }
        } catch (e) {
            console.error(e);
            setShowErrorToast(true);
        } finally {
            setIsPurchasing(false);
        }
    };

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
                    <p className="text-zinc-400 leading-relaxed">
                        {token.nft.description || 'No description available.'}
                    </p>
                </div>

                {/* Properties */}
                <div className="flex flex-col">
                    <div className="order-last lg:order-first">
                        <TokenProperties nft={token.nft} />
                    </div>
                    <div className="mt-auto py-4 order-first lg:order-last">
                        <div className="bg-slate-900/70 border border-sky-800/80 rounded-xl p-4
                            mb-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Tag className="w-5 h-5 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Price</p>
                                </div>
                                <p className="font-mono text-xl text-white font-bold">
                                    {token.orderData?.args.price
                                        ? `${formatEther(BigInt(token.orderData.args.price))} ETH`
                                        : 'Not Listed'}
                                </p>
                            </div>
                        </div>
                        {!isPurchaseComplete && (
                            <button
                                className="w-full lg:w-64 group flex items-center justify-center
                                    gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white
                                    font-semibold rounded-xl transform hover:scale-105
                                    active:scale-95 transition-all duration-200 ease-out shadow-lg
                                    hover:shadow-xl hover:shadow-sky-500/25 disabled:opacity-50
                                    disabled:cursor-not-allowed"
                                disabled={
                                    !token?.orderData?.args.orderId ||
                                    !token.orderData.args.price ||
                                    isPending ||
                                    isPurchasing
                                }
                                onClick={handlePurchase}
                            >
                                {isPurchasing ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Purchasing...</span>
                                    </>
                                ) : (
                                    <span>Buy Now</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </TokenPageLayout>
            {showSuccessToast ? <Toast variant="success" message="Your order was filled!" /> : null}
            {showErrorToast ? (
                <Toast variant="error" message="Could not complete your order" />
            ) : null}
        </>
    );
}

export default function ViewToken() {
    return <Token />;
}
