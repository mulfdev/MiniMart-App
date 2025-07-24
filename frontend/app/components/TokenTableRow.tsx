import { useState } from 'react';
import { Link } from 'react-router';
import type { Nft, OrderListed } from '@minimart/types';
import { formatEther } from 'viem';

export function TokenTableRow({
    nft,
    orderInfo,
    variant = 'view',
}: {
    nft: Nft;
    orderInfo?: OrderListed;
    variant?: 'list' | 'view';
}) {
    const [isVisible, setIsVisible] = useState(true);

    const handleImageError = () => {
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    const linkTo =
        variant === 'list'
            ? `/list/${nft.contract.address}/${nft.tokenId}`
            : `/token/${nft.orderId}`;

    return (
        <div
            className="group relative flex items-center space-x-4 p-4 rounded-2xl transition-all
                duration-300
                [background:linear-gradient(145deg,rgba(8,19,35,0.35),rgba(18,26,46,0.1))]
                hover:[background:linear-gradient(145deg,rgba(8,19,35,0.55),rgba(18,26,46,0.3))]
                border border-cyan-300/25 shadow-[0_8px_14px_rgba(0,200,255,.06)]"
        >
            <img
                src={nft.image.thumbnailUrl || '/placeholder.svg'}
                alt={nft.name || `Token ${nft.tokenId}`}
                onError={handleImageError}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-grow min-w-0">
                <div
                    className="text-lg font-bold text-cyan-100/90 group-hover:text-cyan-50 truncate"
                >
                    {nft.name || `Token #${nft.tokenId}`}
                </div>
                <div className="text-sm text-cyan-400/70 truncate">{nft.contract.name}</div>
            </div>

            <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
                {orderInfo ? (
                    <div className="flex items-baseline text-sm text-cyan-300/80 w-40">
                        <span className="font-semibold text-cyan-300 mr-1.5 whitespace-nowrap">
                            Price:
                        </span>
                        <span className="font-mono text-cyan-100 font-semibold truncate">
                            {formatEther(BigInt(orderInfo.price))} ETH
                        </span>
                    </div>
                ) : (
                    <>
                        <div
                            className="flex items-baseline text-sm text-gray-400 w-40"
                            title={nft.tokenId}
                        >
                            <span className="font-semibold text-gray-300 mr-1.5 whitespace-nowrap">
                                Token ID:
                            </span>
                            <span className="truncate">{nft.tokenId}</span>
                        </div>
                        <div
                            className="flex items-baseline text-sm text-gray-400 w-32"
                            title={nft.tokenType}
                        >
                            <span className="font-semibold text-gray-300 mr-1.5">Type:</span>
                            <span className="truncate">{nft.tokenType}</span>
                        </div>
                    </>
                )}
            </div>

            <Link
                to={linkTo}
                className="px-4 py-2 text-sm font-semibold text-cyan-100 bg-cyan-900/50 border
                    border-cyan-300/30 rounded-lg hover:bg-cyan-800/70 transition-colors
                    flex-shrink-0"
            >
                {variant === 'list' ? 'List' : 'View'}
            </Link>
        </div>
    );
}
