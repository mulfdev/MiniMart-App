import { formatEther } from 'viem';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import type { OrderListed, Nft } from '@minimart/types';

interface ListingCardMobileProps {
    item: { nft: Nft; orderInfo: OrderListed };
    selectedOrderIds: string[];
    handleCheckboxChange: (orderId: string, isChecked: boolean) => void;
    inProgress: string | null;
}

export function ListingCardMobile({
    item,
    selectedOrderIds,
    handleCheckboxChange,
    inProgress,
}: ListingCardMobileProps) {
    return (
        <div
            key={`mobile-${item.orderInfo.id}`}
            className="block sm:hidden bg-zinc-800 rounded-xl mx-4 my-3 p-5 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:ring-1 hover:ring-blue-500"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center flex-grow min-w-0">
                    <label className="flex items-center p-3 -ml-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-red-600 transition duration-150
                                ease-in-out flex-shrink-0"
                            checked={selectedOrderIds.includes(item.orderInfo.orderId)}
                            onChange={(e) =>
                                handleCheckboxChange(item.orderInfo.orderId, e.target.checked)
                            }
                            disabled={!!inProgress}
                        />
                    </label>
                    <div className="h-16 w-16 flex-shrink-0 ml-3">
                        <img
                            loading="lazy"
                            className="h-16 w-16 rounded-lg object-cover"
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
                        <div className="font-medium text-white text-lg truncate">
                            {item.nft.contract.name} #{item.nft.tokenId}
                        </div>
                        <div className="text-zinc-400 text-sm truncate mt-1">
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
                        {new Date(item.orderInfo.blockTimestamp * 1000).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-400">Expires</span>
                    <span className="text-white text-right">—</span>
                </div>
            </div>
        </div>
    );
}
