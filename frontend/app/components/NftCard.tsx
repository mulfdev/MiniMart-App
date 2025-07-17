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
    const [isHovered, setIsHovered] = useState(false);
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
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-80 h-96 perspective-1000"
            >
                {/* outer glow chassis */}
                <div
                    className={`absolute inset-0
                        bg-[radial-gradient(ellipse_at_50%_-20%,_#5B22E5_0%,_#21B9CE_12%,_transparent_26%)]
                        rounded-2xl opacity-10 group-hover:opacity-20 blur-2xl transition-all
                        duration-500`}
                />

                <div
                    className={`relative w-full h-full transition-all duration-500
                        transform-style-preserve-3d ${isHovered ? 'rotate-y-12 scale-[1.02]' : ''}`}
                >
                    {/* icy glass card body */}
                    <div
                        className="absolute inset-0
                            [background:linear-gradient(145deg,rgba(8,19,35,0.35),rgba(18,26,46,0.1))]
                            backdrop-blur-xl border border-cyan-300/25 rounded-2xl
                            shadow-[0_8px_14px_rgba(0,200,255,.06)]"
                    />

                    {/* holo border (new) */}
                    <div
                        className="absolute inset-0 rounded-2xl
                            [background:linear-gradient(120deg,#0891B2,transparent,#0891B2)]
                            opacity-0 group-hover:opacity-60 p-0.5 group-hover:p-[1px]
                            transition-all duration-500"
                    />

                    {/* inner plating (bevel) */}
                    <div
                        className="absolute rounded-2xl
                            [background:linear-gradient(115deg,#04101A,#02131F)]"
                    />

                    {/* content */}
                    <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                        {/* image */}
                        <div
                            className="relative -mx-[1px] -mt-[1px] rounded-t-2xl overflow-hidden
                                flex-1"
                        >
                            <img
                                loading="lazy"
                                src={nft.image.originalUrl || nft.tokenUri || '/placeholder.svg'}
                                alt={`${nft.contract.name} #${nft.tokenId}`}
                                className="w-full h-full object-cover group-hover:scale-[1.06]
                                    transition-transform duration-500"
                                onError={onImageError}
                            />
                        </div>

                        {/* footer */}
                        <div className="pt-4 space-y-3">
                            <h3
                                className="text-xl font-bold text-cyan-100/90
                                    group-hover:text-cyan-50 truncate"
                            >
                                {nft.contract.name} #{nft.tokenId}
                            </h3>

                            {orderInfo ? (
                                <div
                                    className="flex items-center justify-between bg-cyan-900/20
                                        border border-cyan-300/20 rounded-lg px-3 py-2"
                                >
                                    <span className="text-sm text-cyan-300/80">Price</span>
                                    <span className="font-mono text-cyan-100 font-semibold">
                                        {formatEther(BigInt(orderInfo.price))} ETH
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-cyan-400/50 italic">Not Listed</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CardLinkWrapper>
    );
}
