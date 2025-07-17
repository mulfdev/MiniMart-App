import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { NftCard } from '~/components/NftCard';
import { useNavigate, Link, useLoaderData } from 'react-router';
import { fetchAllOrders } from '~/loaders';
import { useState } from 'react';

export async function clientLoader() {
    const allOrders = await fetchAllOrders();
    return allOrders;
}

function OpenListings() {
    const allOrders = useLoaderData<typeof clientLoader>();
    const [activeIndex, setActiveIndex] = useState(0);

    const orders = allOrders.nfts || [];
    const totalOrders = orders.length;

    const goToNext = () => setActiveIndex((i) => (i + 1) % totalOrders);
    const goToPrev = () => setActiveIndex((i) => (i - 1 + totalOrders) % totalOrders);

    if (totalOrders === 0) {
        return (
            <div className="text-center py-10 w-full">
                <p className="text-zinc-400">No open listings at the moment.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop View (lg and up) */}
            <div className="hidden lg:block relative w-full h-[550px] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    {orders.map(({ nft, orderInfo }, index) => {
                        const distance = (index - activeIndex + totalOrders) % totalOrders;
                        const isFocused = distance === 0;
                        const isInStack = distance > 0 && distance < 4;
                        const hasLeft = distance >= totalOrders - 1 && totalOrders > 3;

                        const style: React.CSSProperties = {
                            position: 'absolute',
                            width: '375px',
                            height: '530px',
                            top: '10px',
                            left: '50%',
                            transition: 'all 0.4s ease-out',
                            transform: 'translateX(-50%) scale(1)', // Default to centered
                            zIndex: totalOrders - distance,
                            opacity: 0,
                        };

                        if (isFocused) {
                            // Position on the left side of the container
                            style.transform = 'translateX(calc(-50% - 250px)) scale(1)';
                            style.opacity = 1;
                        } else if (isInStack) {
                            // Position in a stack on the right side
                            style.transform = `translateX(calc(-50% + 200px + ${
                                distance * 60
                            }px)) scale(${1 - distance * 0.08})`;
                            style.opacity = 1;
                        } else {
                            // Cards far in the stack are positioned off-screen
                            style.transform = `translateX(calc(-50% + 200px + ${
                                4 * 60
                            }px)) scale(${1 - 4 * 0.08})`;
                        }

                        if (hasLeft) {
                            // Cards that have moved past the focused view are positioned off-screen
                            style.transform = 'translateX(calc(-50% - 500px)) scale(0.85)';
                        }

                        return (
                            <div key={`${nft.contract.address}-${nft.tokenId}`} style={style}>
                                <NftCard nft={nft} orderInfo={orderInfo} variant="view" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Unified Mobile & Tablet View (below lg) */}
            <div className="lg:hidden">
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-x-4 py-4
                        desktop-order-feed"
                >
                    {orders.map(({ nft, orderInfo }) => (
                        <div
                            key={`${nft.contract.address}+${nft.tokenId}`}
                            className="snap-center shrink-0"
                        >
                            <NftCard nft={nft} orderInfo={orderInfo} variant="view" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop Controls (lg and up) */}
            <div className="hidden lg:flex justify-center items-center gap-4 mt-8">
                <button
                    onClick={goToPrev}
                    className="p-3 rounded-full bg-zinc-800/70 hover:bg-zinc-700/90 ring-1
                        ring-inset ring-zinc-700/80 transition-colors disabled:opacity-50"
                    aria-label="Previous"
                    disabled={totalOrders <= 1}
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <button
                    onClick={goToNext}
                    className="p-3 rounded-full bg-zinc-800/70 hover:bg-zinc-700/90 ring-1
                        ring-inset ring-zinc-700/80 transition-colors disabled:opacity-50"
                    aria-label="Next"
                    disabled={totalOrders <= 1}
                >
                    <ArrowRight className="w-6 h-6 text-white" />
                </button>
            </div>
        </>
    );
}

export default function LandingPage() {
    const { address } = useAccount();
    const { setOpen } = useModal();
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto md:snap-none md:h-auto md:overflow-auto overflow-y-scroll">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border
                            border-zinc-700/50 rounded-full mb-8 backdrop-blur-sm"
                    >
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-sm text-zinc-300 font-medium">Now in Beta</span>
                    </div>

                    {/* Main Headline */}
                    <h1
                        className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6
                            leading-tight"
                    >
                        Sell Your NFTs
                        <br />
                        <span
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400
                                to-purple-400"
                        >
                            Directly on Farcaster
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        A Mini App that lets you list and sell your NFTs without leaving Farcaster.
                        Simple, straightforward, and integrated with your social network.
                    </p>

                    {/* CTA Buttons */}
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
                                setOpen(true);
                            }}
                            className="group flex items-center gap-2 px-8 py-4 bg-blue-600
                                hover:bg-blue-500 text-white font-semibold rounded-xl transform
                                hover:scale-105 active:scale-95 transition-all duration-200 ease-out
                                shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                        >
                            <span>Try It Now</span>
                            <ArrowRight
                                className="w-5 h-5 transform group-hover:translate-x-1
                                    transition-transform duration-200"
                            />
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
                            bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl
                            transform hover:scale-105 active:scale-95 transition-all duration-200
                            ease-out"
                    >
                        <span>View All</span>
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
    );
}
