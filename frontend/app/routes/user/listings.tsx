import type { Route } from '../+types/list';
import { fetchUserOrders } from '~/loaders';
import { useLoaderData } from 'react-router';
import { EmptyState } from '~/components/EmptyState';
import { Page } from '~/components/Page';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '~/config';
import minimartAbi from '~/minimartAbi';
import { miniMartAddr } from '~/utils';
import { fetchAllOrders, fetchNfts } from '~/loaders';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import { ListingRow } from '~/components/ListingRow';

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
            setInProgress('batch');
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

            setSelectedOrderIds([]);
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
    const allSelected = selectedOrderIds.length === data.length && data.length > 0;

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedOrderIds(data.map((item) => item.orderInfo.orderId));
        } else {
            setSelectedOrderIds([]);
        }
    };

    return (
        <div>
            <div className="p-4 flex justify-end items-center gap-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-5 w-5 text-red-400 bg-slate-800/60 border-slate-600/50 rounded
                            transition duration-150 ease-in-out focus:ring-2 focus:ring-red-400/30
                            focus:border-red-400/50"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={allSelected}
                        disabled={!!inProgress}
                    />
                    <label className="text-sm text-slate-300">Select All</label>
                </div>
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
            <div className="space-y-4">
                {data.map((item) => (
                    <ListingRow
                        key={item.orderInfo.transactionHash}
                        item={item}
                        onCheckboxChange={handleCheckboxChange}
                        isChecked={selectedOrderIds.includes(item.orderInfo.orderId)}
                        inProgress={!!inProgress}
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
