import { ArrowLeft, ArrowRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { NftCard } from '~/components/NftCard';
import { useNavigate, Link, useLoaderData } from 'react-router';
import { fetchAllOrders } from '~/loaders';
import { ParticleField } from '~/components/ParticleField';

export async function clientLoader() {
    const allOrders = await fetchAllOrders();
    return allOrders;
}

function FloatingShapes() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated floating shapes */}
            <div
                className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/20
                    to-purple-500/20 rounded-full blur-xl animate-float-slow"
            />
            <div
                className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-500/20
                    to-orange-500/20 rounded-full blur-lg animate-float-medium"
            />
            <div
                className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-cyan-500/15
                    to-blue-500/15 rounded-full blur-2xl animate-float-fast"
            />
            <div
                className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br
                    from-violet-500/20 to-pink-500/20 rounded-full blur-lg animate-float-slow"
            />

            {/* Morphing blob shapes */}
            <div className="absolute top-1/3 left-1/2 w-64 h-64 opacity-10">
                <div
                    className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400
                        rounded-full animate-morph blur-3xl"
                />
            </div>
        </div>
    );
}

function OpenListings() {
    const allOrders = useLoaderData<typeof clientLoader>();
    const [activeIndex, setActiveIndex] = useState(0);
    const [previousActiveIndex, setPreviousActiveIndex] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const orders = allOrders.nfts || [];
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

    if (totalOrders === 0) {
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
                                        rounded-full scale-125`
                                    : `w-3 h-3 bg-white/30 hover:bg-white/50 rounded-full
                                        hover:scale-110`
                            }`}
                        >
                            {index === activeIndex && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-400
                                        to-purple-400 rounded-full blur animate-pulse"
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

export default function Home() {
    const { address } = useAccount();
    const navigate = useNavigate();

    return (
        <>
            <FloatingShapes />
            <ParticleField />

            <div
                className="relative z-10 max-w-7xl mx-auto md:snap-none md:h-auto md:overflow-auto
                    overflow-y-scroll"
            >
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-10">
                    <div className="text-center max-w-5xl mx-auto mt-12">
                        {/* Floating badge */}
                        <div
                            className="inline-flex items-center gap-3 px-6 py-3 mb-12
                                bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl
                                border border-white/20 rounded-full shadow-2xl animate-float-slow"
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                                <div
                                    className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full
                                        animate-ping"
                                />
                            </div>
                            <span
                                className="text-sm font-semibold bg-gradient-to-r from-blue-400
                                    to-purple-400 bg-clip-text text-transparent"
                            >
                                Now in Beta
                            </span>
                        </div>

                        {/* Main headline with advanced typography */}
                        <h1
                            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6
                                leading-tight"
                        >
                            <span className="block">Sell Your NFTs</span>
                            <span className="block relative">
                                <span
                                    className="relative z-10 bg-gradient-to-r from-blue-400
                                        via-purple-400 to-pink-400 bg-clip-text text-transparent
                                        animate-gradient-x"
                                >
                                    Directly on Farcaster
                                </span>
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-400
                                        via-purple-400 to-pink-400 blur-3xl opacity-30
                                        animate-pulse"
                                />
                            </span>
                        </h1>

                        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            A Mini App that lets you list and sell your NFTs without leaving
                            Farcaster. Simple, straightforward, and integrated with your social
                            network.
                        </p>

                        {/* Enhanced CTA section */}
                        <div
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center
                                mb-16"
                        >
                            <button
                                onClick={() => {
                                    if (address) {
                                        navigate(`/user/${address}`);
                                        return;
                                    }
                                }}
                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600
                                    to-purple-600 text-white font-semibold rounded-xl
                                    overflow-hidden transition-all duration-300 hover:scale-105
                                    active:scale-95 shadow-2xl hover:shadow-blue-500/25"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-500
                                        to-purple-500 opacity-0 group-hover:opacity-100
                                        transition-opacity duration-300"
                                />
                                <div className="relative flex items-center gap-2">
                                    <span>Try It Now</span>
                                    <ArrowRight
                                        className="w-5 h-5 transform group-hover:translate-x-1
                                            transition-transform duration-200"
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Open Listings Section */}
                <section className="container mx-auto px-4 py-8 md:py-16">
                    <div className="flex items-end justify-between md:items-center gap-4 mb-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                Open Listings
                            </h2>
                            <p className="hidden md:inline text-lg text-zinc-400">
                                Check out the latest NFTs available for purchase.
                            </p>
                        </div>
                        <Link
                            to="/orders"
                            className="flex-shrink-0 md:mt-0 group flex items-start gap-2 px-6 py-3
                                bg-zinc-800/50 hover:bg-zinc-700/50 backdrop-blur-sm border
                                border-white/10 text-white font-semibold rounded-xl transform
                                hover:scale-105 active:scale-95 transition-all duration-200
                                ease-out"
                        >
                            <span>View All</span>
                            <ArrowUpRight
                                className="w-5 h-5 transform group-hover:translate-x-1
                                    group-hover:-translate-y-1 transition-transform duration-200"
                            />
                        </Link>
                    </div>
                    <OpenListings />
                </section>

                {/* Footer */}
                <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 bg-blue-500 rounded-md flex items-center
                                    justify-center"
                            >
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-semibold">MiniMart</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
