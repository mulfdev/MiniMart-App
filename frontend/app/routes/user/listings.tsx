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
        <div
            className="sm:border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm
                bg-slate-900/40"
            style={{
                backgroundImage: [
                    'radial-gradient(ellipse 200% 100% at 50% 0%, rgba(22, 40, 65, 0.3) 0%, rgba(26, 60, 95, 0.15) 30%, rgba(15, 30, 53, 0.08) 60%, transparent 90%)',
                    'radial-gradient(ellipse 150% 120% at 80% 100%, rgba(10, 26, 45, 0.2) 0%, rgba(5, 18, 34, 0.1) 50%, transparent 80%)',
                ].join(','),
                boxShadow:
                    'inset 0 0 40px rgba(6, 20, 40, 0.2), inset 0 0 10px rgba(21, 93, 255, 0.05)',
            }}
        >
            <div className="p-4 flex justify-end">
                <button
                    onClick={batchRemoveOrders}
                    disabled={isBatchRemoveDisabled}
                    className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm
                        font-semibold text-white transition-all duration-200 ease-in-out
                        disabled:opacity-50 disabled:cursor-not-allowed bg-red-900/30 border
                        border-red-700/40 backdrop-blur-sm hover:bg-red-900/50
                        hover:border-red-700/60 hover:shadow-lg hover:shadow-red-500/10"
                >
                    {inProgress === 'batch' ? (
                        <LoadingSpinner />
                    ) : (
                        `Remove Selected (${selectedOrderIds.length})`
                    )}
                </button>
            </div>
            <div className="overflow-x-auto hidden sm:block">
                <table className="min-w-full divide-y divide-slate-700/30">
                    <thead className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/30">
                        <tr>
                            <th
                                scope="col"
                                className="py-4 pl-6 pr-3 text-left text-sm font-semibold
                                    text-slate-100"
                            >
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-red-400 bg-slate-800/60
                                        border-slate-600/50 rounded transition duration-150
                                        ease-in-out focus:ring-2 focus:ring-red-400/30
                                        focus:border-red-400/50"
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
                                    text-slate-100"
                            >
                                Token
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-4 text-left text-sm font-semibold text-slate-100"
                            >
                                Price
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-4 text-left text-sm font-semibold text-slate-100"
                            >
                                Listed
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-4 text-left text-sm font-semibold text-slate-100"
                            >
                                Expires
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/20">
                        {data.map((item) => (
                            <tr
                                key={item.orderInfo.id}
                                className="transition-all duration-200 ease-in-out bg-slate-800/10
                                    hover:bg-slate-700/25 hover:shadow-lg hover:shadow-blue-500/5"
                            >
                                <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-red-400 bg-slate-800/60
                                            border-slate-600/50 rounded transition duration-150
                                            ease-in-out focus:ring-2 focus:ring-red-400/30
                                            focus:border-red-400/50"
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
                                                className="h-11 w-11 rounded-lg object-cover border
                                                    border-slate-600/30 shadow-lg"
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
                                            <div className="font-medium text-slate-100">
                                                {item.nft.contract.name} #{item.nft.tokenId}
                                            </div>
                                            <div className="text-slate-400">
                                                {item.nft.contract.symbol}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-slate-100">
                                            {formatEther(BigInt(item.orderInfo.price))}
                                        </span>
                                        <span className="text-slate-400">ETH</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-300">
                                    {new Date(
                                        item.orderInfo.blockTimestamp * 1000
                                    ).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-4 py-5 text-sm text-slate-300">
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
