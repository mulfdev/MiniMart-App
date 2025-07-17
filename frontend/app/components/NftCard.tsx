import { Sparkles, Tag } from 'lucide-react';
import type { Nft, OrderListed } from '@minimart/types';
import { Link } from 'react-router';
import { formatEther } from 'viem';
import { useState, useRef, type PropsWithChildren } from 'react';
import { useOnClickOutside } from '~/hooks/useOnClickOutside';

const CardLinkWrapper = ({
    variant,
    nft,
    children,
}: PropsWithChildren<{ variant: 'list' | 'view' | 'remove'; nft: Nft }>) => {
    const to =
        variant === 'list'
            ? `/list/${nft.contract.address}/${nft.tokenId}`
            : `/token/${nft.contract.address}/${nft.tokenId}`;

    return variant === 'remove' ? (
        <>{children}</>
    ) : (
        <Link to={to} className="w-full">
            {children}
        </Link>
    );
};

export function NftCard({
    nft,
    orderInfo,
    variant = 'list',
    onImageError,
}: {
    nft: Nft;
    orderInfo?: OrderListed;
    variant?: 'list' | 'view' | 'remove';
    onImageError?: () => void;
}) {
    const [isActionsVisible, setActionsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(cardRef, () => setActionsVisible(false));

    return (
        <CardLinkWrapper variant={variant} nft={nft}>
            <div
                ref={cardRef}
                onClick={(e) => {
                    if (variant !== 'remove') return;
                    e.preventDefault();
                    setActionsVisible(!isActionsVisible);
                }}
                className={`group relative bg-zinc-900 rounded-2xl overflow-hidden h-[500px] flex
                    flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform hover:-translate-y-2
                    transition-transform duration-500 ease-out border border-zinc-800/50
                    hover:border-zinc-700/80 w-[315px]`}
            >
                <div className="relative overflow-hidden h-full bg-zinc-800">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            loading="lazy"
                            src={nft.image.originalUrl || nft.tokenUri || '/placeholder.svg'}
                            className="w-full h-full object-cover"
                            onError={onImageError}
                        />
                    </div>
                </div>

                <div className="p-4 flex flex-col justify-between">
                    {/* Top Text Section */}
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <h2
                                className="truncate text-lg sm:text-xl font-bold text-white
                                    leading-normal group-hover:text-blue-100 transition-colors
                                    duration-300 drop-shadow-sm"
                            >
                                {nft.contract.name} #{nft.tokenId}
                            </h2>
                            <Sparkles
                                className="w-4 h-4 text-yellow-400/60 group-hover:text-yellow-400
                                    transition-all duration-300 flex-shrink-0 mt-1
                                    group-hover:rotate-12 group-hover:scale-110"
                            />
                        </div>
                        {orderInfo ? (
                            <div
                                className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-2
                                    mb-4"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-5 h-5 text-zinc-500" />
                                        <p className="text-sm text-zinc-400">Price</p>
                                    </div>
                                    <p className="font-mono text-xl text-white font-bold">
                                        {formatEther(BigInt(orderInfo.price))} ETH
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-2
                                    mb-4"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-5 h-5 text-zinc-500" />
                                        <p className="text-sm text-zinc-400">Price</p>
                                    </div>
                                    <p className="font-mono text-xl text-white font-bold">
                                        Not Listed
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                </div>
                <div
                    className={`absolute bottom-0 left-0 w-full bg-zinc-900/80 transform
                        transition-transform duration-300 ease-in-out will-change-transform ${
                            isActionsVisible
                                ? 'translate-y-0'
                                : 'translate-y-full group-hover:translate-y-0'
                        }`}
                ></div>
            </div>
        </CardLinkWrapper>
    );
}
