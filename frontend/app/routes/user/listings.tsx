import type { Route } from '../+types/view';
import { fetchUserOrders } from '~/loaders';
import { useLoaderData } from 'react-router';
import { EmptyState } from '~/components/EmptyState';
import { Page } from '~/components/Page';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '~/config';
import minimartAbi from '~/minimartAbi';
import { miniMartAddr } from '~/utils';
import { fetchAllOrders, fetchNfts } from '~/loaders';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import type { OrderListed, Nft } from '@minimart/types';

export async function clientLoader({ params }: Route.LoaderArgs) {
    const listings = fetchUserOrders(params.address);
    return listings;
}

function Listings() {
    const data = useLoaderData<typeof clientLoader>();
    const { address } = useAccount();
    const [inProgress, setInProgress] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const revalidator = useRevalidator();

    async function removeOrder(order: { nft: Nft; orderInfo: OrderListed }) {
        try {
            setInProgress(order.orderInfo.id);
            const simulateTx = await simulateContract(wagmiConfig, {
                abi: minimartAbi,
                address: miniMartAddr,
                functionName: 'removeOrder',
                args: [order.orderInfo.orderId as `0x${string}`],
            });
            if (!simulateTx.request) {
                throw new Error('Transaction simulation failed');
            }
            const txHash = await writeContract(wagmiConfig, simulateTx.request);
            await waitForTransactionReceipt(wagmiConfig, { hash: txHash, confirmations: 5 });

            fetchNfts(address!, true);
            fetchAllOrders(true);
            await fetchUserOrders(address!, true);
            revalidator.revalidate();
        } catch (e) {
            console.log(e);
        } finally {
            setInProgress(null);
        }
    }

    async function batchRemoveOrders() {
        try {
            setInProgress('batch'); // Use a special identifier for batch in progress
            const simulateTx = await simulateContract(wagmiConfig, {
                abi: minimartAbi,
                address: miniMartAddr,
                functionName: 'batchRemoveOrder',
                args: [selectedOrderIds as `0x${string}`[]],
            });
            if (!simulateTx.request) {
                throw new Error('Transaction simulation failed');
            }
            const txHash = await writeContract(wagmiConfig, simulateTx.request);
            await waitForTransactionReceipt(wagmiConfig, { hash: txHash, confirmations: 5 });

            setSelectedOrderIds([]); // Clear selections on success
            fetchNfts(address!, true);
            fetchAllOrders(true);
            await fetchUserOrders(address!, true);
            revalidator.revalidate();
        } catch (e) {
            console.log(e);
        } finally {
            setInProgress(null);
        }
    }

    function handleCheckboxChange(orderId: string, isChecked: boolean) {
        if (isChecked) {
            setSelectedOrderIds((prev) => [...prev, orderId]);
        } else {
            setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
        }
    }

    if (!data || data.length === 0) {
        return <EmptyState message="No listings found." />;
    }

    const isBatchRemoveDisabled = selectedOrderIds.length === 0 || !!inProgress;

    return (
        <>
            {data && data.length > 0 ? (
                <div className="bg-zinc-900 border border-zinc-800/50 rounded-2xl overflow-hidden">
                    <div className="p-4 flex justify-end">
                        <button
                            onClick={batchRemoveOrders}
                            disabled={isBatchRemoveDisabled}
                            className="flex items-center justify-center gap-2 rounded-md
                                bg-red-600/20 px-3 py-2 text-sm font-semibold text-red-400
                                hover:bg-red-600/30 transition-colors duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {inProgress === 'batch' ? (
                                <LoadingSpinner />
                            ) : (
                                `Remove Selected (${selectedOrderIds.length})`
                            )}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-700/50">
                            <thead className="bg-zinc-800/50 hidden sm:table-header-group">
                                <tr>
                                    <th
                                        scope="col"
                                        className="py-4 pl-6 pr-3 text-left text-sm font-semibold
                                            text-white"
                                    >
                                        <label className="block p-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-red-600 transition
                                                    duration-150 ease-in-out"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedOrderIds(
                                                            data.map((item) => item.orderInfo.orderId)
                                                        );
                                                    } else {
                                                        setSelectedOrderIds([]);
                                                    }
                                                }}
                                                checked={
                                                    selectedOrderIds.length === data.length &&
                                                    data.length > 0
                                                }
                                                disabled={!!inProgress}
                                            />
                                        </label>
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-4 pl-3 pr-3 text-left text-sm font-semibold
                                            text-white"
                                    >
                                        Token
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-4 text-left text-sm font-semibold
                                            text-white"
                                    >
                                        Price
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-4 text-left text-sm font-semibold
                                            text-white"
                                    >
                                        Listed
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-4 text-left text-sm font-semibold
                                            text-white"
                                    >
                                        Expires
                                    </th>
                                    
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {data.map((item) => (
                                    <>
                                        {/* Desktop/Tablet View */}
                                        <tr
                                            key={item.orderInfo.id}
                                            className="hover:bg-zinc-800/50 transition-colors
                                                duration-150 hidden sm:table-row"
                                        >
                                            <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm">
                                                <label className="block p-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-4 w-4 text-red-600
                                                            transition duration-150 ease-in-out"
                                                        checked={selectedOrderIds.includes(
                                                            item.orderInfo.orderId
                                                        )}
                                                        onChange={(e) =>
                                                            handleCheckboxChange(
                                                                item.orderInfo.orderId,
                                                                e.target.checked
                                                            )
                                                        }
                                                        disabled={!!inProgress}
                                                    />
                                                </label>
                                            </td>
                                            <td className="whitespace-nowrap py-5 pl-3 pr-3 text-sm">
                                                <div className="flex items-center">
                                                    <div className="h-11 w-11 flex-shrink-0">
                                                        <img
                                                            loading="lazy"
                                                            className="h-11 w-11 rounded-lg
                                                                object-cover"
                                                            src={
                                                                item.nft.image.thumbnailUrl ||
                                                                item.nft.image.originalUrl ||
                                                                item.nft.tokenUri ||
                                                                '/placeholder.svg'
                                                            }
                                                            alt={`${item.nft.contract.name} #${item.nft.tokenId}`}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-white">
                                                            {item.nft.contract.name} #{item.nft.tokenId}
                                                        </div>
                                                        <div className="text-zinc-400">
                                                            {item.nft.contract.symbol}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                className="whitespace-nowrap px-4 py-5 text-sm
                                                    text-zinc-300"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-white">
                                                        {formatEther(BigInt(item.orderInfo.price))}
                                                    </span>
                                                    <span className="text-zinc-400">ETH</span>
                                                </div>
                                            </td>
                                            <td
                                                className="whitespace-nowrap px-4 py-5 text-sm
                                                    text-zinc-300"
                                            >
                                                {new Date(
                                                    item.orderInfo.blockTimestamp * 1000
                                                ).toLocaleDateString()}
                                            </td>
                                            <td
                                                className="whitespace-nowrap px-4 py-5 text-sm
                                                    text-zinc-300"
                                            >
                                                —
                                            </td>
                                            
                                        </tr>

                                        {/* Mobile Card View */}
                                        <div
                                            key={`mobile-${item.orderInfo.id}`}
                                            className="block sm:hidden bg-zinc-800/50 rounded-xl
                                                mx-4 my-3 p-5 shadow-lg"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center flex-grow min-w-0 pr-2">
                                                    <label className="flex items-center p-2 -ml-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox h-4 w-4 text-red-600
                                                                transition duration-150 ease-in-out flex-shrink-0"
                                                            checked={selectedOrderIds.includes(
                                                                item.orderInfo.orderId
                                                            )}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(
                                                                    item.orderInfo.orderId,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            disabled={!!inProgress}
                                                        />
                                                    </label>
                                                    <div className="h-12 w-12 flex-shrink-0 ml-3">
                                                        <img
                                                            loading="lazy"
                                                            className="h-12 w-12 rounded-lg
                                                                object-cover"
                                                            src={
                                                                item.nft.image.thumbnailUrl ||
                                                                item.nft.image.originalUrl ||
                                                                item.nft.tokenUri ||
                                                                '/placeholder.svg'
                                                            }
                                                            alt={`${item.nft.contract.name} #${item.nft.tokenId}`}
                                                        />
                                                    </div>
                                                    <div className="ml-4 min-w-0">
                                                        <div className="font-medium text-white truncate">
                                                            {item.nft.contract.name} #{item.nft.tokenId}
                                                        </div>
                                                        <div className="text-zinc-400 text-sm truncate">
                                                            {item.nft.contract.symbol}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            <div className="flex flex-col gap-3 text-sm mt-4 pt-4 border-t border-zinc-700">
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-400">Price</span>
                                                    <span className="font-mono text-white break-all text-right">
                                                        {formatEther(BigInt(item.orderInfo.price))} ETH
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-400">Listed</span>
                                                    <span className="text-white text-right">
                                                        {new Date(
                                                            item.orderInfo.blockTimestamp * 1000
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-400">Expires</span>
                                                    <span className="text-white text-right">—</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <EmptyState message="No listings found." />
            )}
        </>
    );
}

export default function UserListings() {
    return (
        <Page title="Your Listings" description="Manage your active NFT listings.">
            <Listings />
        </Page>
    );
}
