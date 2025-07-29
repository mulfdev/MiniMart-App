import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NftCard } from './NftCard';

export function OpenListingsContent({ resolvedOrders }: { resolvedOrders: any }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [previousActiveIndex, setPreviousActiveIndex] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const orders = resolvedOrders?.nfts || [];
    const totalOrders = orders.length;
    const animDuration = 250;

    const prevAnimationState = useRef({ isAnimating: false, pAIndex: null });
    useEffect(() => {
        prevAnimationState.current = {
            isAnimating: isAnimating,
            pAIndex: previousActiveIndex,
        };
    });
    const wasAnimating = prevAnimationState.current.isAnimating;
    const lastExitingIndex = prevAnimationState.current.pAIndex;

    const goToNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setPreviousActiveIndex(activeIndex);
        setActiveIndex((i) => (i + 1) % totalOrders);
        setTimeout(() => {
            setPreviousActiveIndex(null);
            setIsAnimating(false);
        }, animDuration);
    };

    const goToPrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        const newActiveIndex = (activeIndex - 1 + totalOrders) % totalOrders;
        setPreviousActiveIndex(newActiveIndex);
        setActiveIndex(newActiveIndex);
        setTimeout(() => {
            setPreviousActiveIndex(null);
            setIsAnimating(false);
        }, animDuration);
    };

    if (!resolvedOrders || !orders.length) {
        return (
            <div className="text-center py-20">
                <div
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-zinc-800/50
                        to-zinc-700/50 backdrop-blur-sm rounded-full flex items-center
                        justify-center border border-white/10"
                >
                    <Sparkles className="w-12 h-12 text-zinc-400" />
                </div>
                <p className="text-xl text-zinc-400">No open listings at the moment.</p>
                <div
                    className="mt-4 w-32 h-1 bg-gradient-to-r from-transparent via-zinc-600
                        to-transparent mx-auto rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Desktop View (lg and up) */}
            <div
                className="hidden lg:block relative w-full h-[520px]"
                style={{ perspective: '1200px' }}
            >
                <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                    {orders.map(({ nft, orderInfo }, index) => {
                        const isFocused = index === activeIndex;
                        const isExiting = index === previousActiveIndex;

                        const style: React.CSSProperties = {
                            position: 'absolute',
                            width: '320px',
                            height: '420px',
                            top: '20px',
                            left: '50%',
                            transformOrigin: 'center center',
                        };

                        let transform = '';
                        let opacity = 0;
                        let zIndex = 0;
                        let filter = 'brightness(1)';
                        style.transition = `all ${animDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`;

                        if (isFocused) {
                            transform = 'translateX(-120%) translateZ(0) rotateY(0deg) scale(1.1)';
                            opacity = 1;
                            zIndex = totalOrders;
                        } else if (isExiting) {
                            transform =
                                'translateX(-170%) translateZ(-200px) rotateY(0deg) scale(0.8)';
                            opacity = 0;
                            zIndex = totalOrders - 1;
                        } else {
                            const distance = (index - activeIndex + totalOrders) % totalOrders;
                            const isInStack = distance > 0 && distance < 4;

                            if (isInStack) {
                                const scale = 1 - distance * 0.1;
                                const xOffset = `calc(-50% + 80px + ${distance * 110}px)`;
                                const zOffset = -distance * 100;
                                const rotateY = -distance * 10;
                                transform = `translateX(${xOffset}) translateZ(${zOffset}px) rotateY(${rotateY}deg) scale(${scale})`;
                                opacity = 1;
                                filter = `brightness(${1 - distance * 0.25})`;
                                zIndex = totalOrders - distance;
                            } else {
                                // Positioned at the back of the stack, invisible
                                const scale = 1 - 4 * 0.1;
                                const xOffset = `calc(-50% + 80px + ${4 * 90}px)`;
                                const zOffset = -4 * 100;
                                const rotateY = -4 * 10;
                                transform = `translateX(${xOffset}) translateZ(${zOffset}px) rotateY(${rotateY}deg) scale(${scale})`;
                                opacity = 0;
                                zIndex = 0;
                            }
                        }

                        style.transform = transform;
                        style.opacity = opacity;
                        style.zIndex = zIndex;
                        style.filter = filter;

                        if (wasAnimating && !isAnimating && index === lastExitingIndex) {
                            style.transition = `opacity ${animDuration}ms ease-out`;
                        }

                        return (
                            <div
                                key={`${nft.contract.address}-${nft.tokenId}`}
                                style={style}
                                className="transform-style-preserve-3d"
                            >
                                <NftCard nft={nft} orderInfo={orderInfo} variant="view" />
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Unified Mobile & Tablet View (below lg) */}
            <div className="lg:hidden">
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-x-6 py-8 px-4
                        desktop-order-feed"
                >
                    {orders.map(({ nft, orderInfo }) => (
                        <div
                            key={`${nft.contract.address}+${nft.tokenId}`}
                            className="snap-center shrink-0"
                        >
                            <NftCard nft={nft} orderInfo={orderInfo} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Desktop Controls (lg and up) */}
            <div className="hidden lg:flex justify-center items-center gap-8 mt-12">
                <button
                    onClick={goToPrev}
                    className="group p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border
                        border-white/20 rounded-full transition-all duration-300 hover:scale-110
                        active:scale-95 shadow-lg hover:shadow-blue-500/25"
                    aria-label="Previous"
                    disabled={totalOrders <= 1 || isAnimating}
                >
                    <ArrowLeft
                        className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors
                            duration-200"
                    />
                </button>

                {/* Enhanced pagination dots */}
                <div className="flex gap-3">
                    {orders.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => !isAnimating && setActiveIndex(index)}
                            className={`relative transition-all duration-300 ${
                                index === activeIndex
                                    ? `w-8 h-3 bg-gradient-to-r from-blue-400 to-purple-400
                                        rounded-full`
                                    : `w-3 h-3 bg-white/30 hover:bg-white/50 rounded-full
                                        hover:scale-110`
                            }`}
                        >
                            {index === activeIndex && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-400
                                        to-purple-400 rounded-full blur"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={goToNext}
                    className="group p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border
                        border-white/20 rounded-full transition-all duration-300 hover:scale-110
                        active:scale-95 shadow-lg hover:shadow-blue-500/25"
                    aria-label="Next"
                    disabled={totalOrders <= 1 || isAnimating}
                >
                    <ArrowRight
                        className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors
                            duration-200"
                    />
                </button>
            </div>
        </div>
    );
}
