import type { Route } from '../+types/list';
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

import { ListingCardMobile } from '~/components/ListingCardMobile';

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
        <div className="sm:bg-zinc-900 border border-zinc-800/50 rounded-2xl overflow-hidden">
            <div className="p-4 flex justify-end">
                <button
                    onClick={batchRemoveOrders}
                    disabled={isBatchRemoveDisabled}
                    className="flex items-center justify-center gap-2 rounded-md bg-red-800
                        sm:bg-red-600/20 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700
                        sm:hover:bg-red-600/30 transition-colors duration-150 disabled:opacity-50
                        disabled:cursor-not-allowed"
                >
                    {inProgress === 'batch' ? (
                        <LoadingSpinner />
                    ) : (
                        `Remove Selected (${selectedOrderIds.length})`
                    )}
                </button>
            </div>
            <div className="overflow-x-auto hidden sm:block">
                <table className="min-w-full divide-y divide-zinc-700/50">
                    <thead className="bg-zinc-800/50">
                        <tr>
                            <th
                                scope="col"
                                className="py-4 pl-6 pr-3 text-left text-sm font-semibold
                                    text-white"
                            >
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-red-600 transition
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
                                        selectedOrderIds.length === data.length && data.length > 0
                                    }
                                    disabled={!!inProgress}
                                />
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
                                className="px-4 py-4 text-left text-sm font-semibold text-white"
                            >
                                Price
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-4 text-left text-sm font-semibold text-white"
                            >
                                Listed
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-4 text-left text-sm font-semibold text-white"
                            >
                                Expires
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {data.map((item) => (
                            <tr
                                key={item.orderInfo.id}
                                className="hover:bg-zinc-800/50 transition-colors duration-150"
                            >
                                <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-red-600 transition
                                            duration-150 ease-in-out"
                                        checked={selectedOrderIds.includes(item.orderInfo.orderId)}
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                item.orderInfo.orderId,
                                                e.target.checked
                                            )
                                        }
                                        disabled={!!inProgress}
                                    />
                                </td>
                                <td className="whitespace-nowrap py-5 pl-3 pr-3 text-sm">
                                    <div className="flex items-center">
                                        <div className="h-11 w-11 flex-shrink-0">
                                            <img
                                                loading="lazy"
                                                className="h-11 w-11 rounded-lg object-cover"
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
                                <td className="whitespace-nowrap px-4 py-5 text-sm text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-white">
                                            {formatEther(BigInt(item.orderInfo.price))}
                                        </span>
                                        <span className="text-zinc-400">ETH</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-5 text-sm text-zinc-300">
                                    {new Date(
                                        item.orderInfo.blockTimestamp * 1000
                                    ).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-4 py-5 text-sm text-zinc-300">
                                    —
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="sm:hidden">
                {data.map((item) => (
                    <ListingCardMobile
                        key={item.orderInfo.id}
                        item={item}
                        selectedOrderIds={selectedOrderIds}
                        handleCheckboxChange={handleCheckboxChange}
                        inProgress={inProgress}
                    />
                ))}
            </div>
        </div>
    );
}

export default function UserListings() {
    return (
        <Page title="Your Listings" description="Manage your active NFT listings.">
            <Listings />
        </Page>
    );
}
