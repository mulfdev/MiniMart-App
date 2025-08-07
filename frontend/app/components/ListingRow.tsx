import { useState } from 'react';
import { Link } from 'react-router';
import type { Nft, OrderListed } from '@minimart/types';
import { formatEther } from 'viem';

export function ListingRow({
    item,
    onCheckboxChange,
    isChecked,
    inProgress,
}: {
    item: { nft: Nft; orderInfo: OrderListed };
    onCheckboxChange: (orderId: string, isChecked: boolean) => void;
    isChecked: boolean;
    inProgress: boolean;
}) {
    const { nft, orderInfo } = item;
    const [isVisible, setIsVisible] = useState(true);

    const handleImageError = () => {
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="group relative flex items-center space-x-4 p-4 rounded-2xl transition-all
                duration-300
                [background:linear-gradient(145deg,rgba(8,19,35,0.35),rgba(18,26,46,0.1))]
                hover:[background:linear-gradient(145deg,rgba(8,19,35,0.55),rgba(18,26,46,0.3))]
                border border-cyan-300/25 shadow-[0_8px_14px_rgba(0,200,255,.06)]"
        >
            <input
                type="checkbox"
                className="h-5 w-5 text-red-400 bg-slate-800/60 border-slate-600/50 rounded
                    transition duration-150 ease-in-out focus:ring-2 focus:ring-red-400/30
                    focus:border-red-400/50 flex-shrink-0"
                checked={isChecked}
                onChange={(e) => onCheckboxChange(orderInfo.orderId, e.target.checked)}
                disabled={inProgress}
            />
            <Link to={`/token/${item.nft.contract.address}/${item.nft.tokenId}`}>
                <div className="flex justify-between">
                    <img
                        loading="lazy"
                        src={nft.image.thumbnailUrl || '/placeholder.svg'}
                        alt={nft.name || `Token ${nft.tokenId}`}
                        onError={handleImageError}
                        className="h-20 w-20 mr-2 rounded-lg object-cover flex-shrink-0"
                    />

                    <div className="flex flex-col text-wrap">
                        <div className="text-lg font-bold text-cyan-100/90 group-hover:text-cyan-50">
                            {nft.name || `Token #${nft.tokenId}`}
                        </div>
                        <div className="text-sm text-cyan-400/70">{nft.contract.name}</div>
                    </div>
                </div>

                <div className="flex items-baseline text-sm text-cyan-300/80 w-40 mt-2">
                    <span className="font-semibold text-cyan-300 mr-1.5 whitespace-nowrap">
                        Price:
                    </span>
                    <span className="font-mono text-cyan-100 font-semibold truncate">
                        {formatEther(BigInt(orderInfo.price))} ETH
                    </span>
                </div>
            </Link>
        </div>
    );
}
