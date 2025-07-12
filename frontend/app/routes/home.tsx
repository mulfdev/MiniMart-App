import { ArrowRight, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { NftCard } from '~/components/NftCard';
import { useNavigate, Link, useLoaderData } from 'react-router';
import { fetchAllOrders } from '~/loaders';

export async function clientLoader() {
    const allOrders = await fetchAllOrders();
    return allOrders;
}

function OpenListings() {
    let allOrders = useLoaderData<typeof clientLoader>();
    return (
        <>
            {allOrders.nfts.map(({ nft, orderInfo }, index) => (
                <div
                    key={`${nft.contract.address}+${nft.tokenId}`}
                    className="snap-center shrink-0 w-80"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <NftCard nft={nft} orderInfo={orderInfo} variant="view" />
                </div>
            ))}
        </>
    );
}

export default function LandingPage() {
    const { address } = useAccount();
    const { setOpen } = useModal();
    const navigate = useNavigate();

    const steps = [
        {
            number: '01',
            title: 'Connect Wallet',
            description: 'Link your wallet to access your NFT collection',
        },
        {
            number: '02',
            title: 'Select NFTs',
            description: 'Choose which NFTs you want to list for sale',
        },
        {
            number: '03',
            title: 'Set Price & Share',
            description: 'Set your price and share with your Farcaster network',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto md:snap-none md:h-auto md:overflow-auto overflow-y-scroll">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12 ">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full mb-8 backdrop-blur-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-sm text-zinc-300 font-medium">Now in Beta</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        Sell Your NFTs
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Directly on Farcaster
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        A Mini App that lets you list and sell your NFTs without leaving Farcaster.
                        Simple, straightforward, and integrated with your social network.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button
                            onClick={() => {
                                if (address) {
                                    navigate(`/user/${address}`);
                                    return;
                                }
                                setOpen(true);
                            }}
                            className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 
                                     text-white font-semibold rounded-xl
                                     transform hover:scale-105 active:scale-95
                                     transition-all duration-200 ease-out
                                     shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                        >
                            <span>Try It Now</span>
                            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
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
                        className="flex-shrink-0 md:mt-0 group flex items-start gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 
                                     text-white font-semibold rounded-xl
                                     transform hover:scale-105 active:scale-95
                                     transition-all duration-200 ease-out"
                    >
                        <span>View All</span>
                    </Link>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 py-4 desktop-order-feed">
                    <OpenListings />
                </div>
            </section>

            {/* How It Works */}
            <section className="container mx-auto px-4 py-16 ">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Three simple steps to start selling
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connection line */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-12 left-full w-full h-px bg-zinc-700/50 z-0" />
                            )}

                            <div className="relative z-10 text-center">
                                {/* Step number */}
                                <div className="w-24 h-24 bg-zinc-900 border-2 border-zinc-700/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-2xl font-bold text-blue-400">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-16 ">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Ready to Try It?
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 
                                     text-white font-semibold rounded-xl
                                     transform hover:scale-105 active:scale-95
                                     transition-all duration-200 ease-out
                                     shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                        >
                            <span>Get Started</span>
                            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-zinc-800/50 ">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">MiniMart</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
