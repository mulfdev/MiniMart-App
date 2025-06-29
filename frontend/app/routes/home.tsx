import { ArrowRight, Zap, Shield, Users, Sparkles, Smartphone, Clock, Globe } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { NftCard } from '~/components/NftCard';
import { NftCardSkeleton } from '~/components/NftCardSkeleton';
import type { Nft } from '@minimart/types';
import { queryClient } from '~/root';
import { useNavigate } from 'react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';

async function fetchOrders() {
    try {
        const response = await fetch('http://localhost:3000/get-orders');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.nfts as Nft[];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

export function clientLoader() {
    queryClient.prefetchQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
        staleTime: 120_000,
    });
    return null;
}

function OpenListings() {
    const { data: nfts } = useSuspenseQuery<Nft[]>({
        queryKey: ['orders'],
        queryFn: fetchOrders,
        staleTime: 120_000,
    });

    return (
        <>
            {nfts?.map((nft, index) => (
                <div
                    key={`${nft.contract.address}+${nft.tokenId}`}
                    className="snap-center shrink-0 w-80"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <NftCard nft={nft} variant="view" />
                </div>
            ))}
        </>
    );
}

export default function LandingPage() {
    const { address } = useAccount();
    const { setOpen } = useModal();
    const navigate = useNavigate();

    const features = [
        {
            icon: Zap,
            title: 'Quick Listing',
            description: 'List your NFTs for sale directly from Farcaster without switching apps',
        },
        {
            icon: Shield,
            title: 'Secure Trading',
            description:
                'Built on established blockchain infrastructure with standard security practices',
        },
        {
            icon: Users,
            title: 'Social Reach',
            description: 'Share your listings with your existing Farcaster followers and network',
        },
    ];

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

    const benefits = [
        {
            icon: Smartphone,
            title: 'All in One App',
            description: 'Manage your NFT sales without leaving Farcaster',
        },
        {
            icon: Clock,
            title: 'Save Time',
            description: 'No need to switch between multiple platforms and apps',
        },
        {
            icon: Globe,
            title: 'Reach Your Network',
            description: 'Leverage your existing social connections for sales',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
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
                                    navigate(`/view/${address}`);
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
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Open Listings
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Check out some of the latest NFTs available for purchase
                    </p>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 py-4 desktop-order-feed">
                    <React.Suspense
                        fallback={Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="snap-center shrink-0 w-80">
                                <NftCardSkeleton />
                            </div>
                        ))}
                    >
                        <OpenListings />
                    </React.Suspense>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Helps</h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Built for Farcaster users who want a simpler way to sell their NFTs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-zinc-900 rounded-2xl p-8 border border-zinc-800/50 hover:border-zinc-700/80
                                     shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.3)]
                                     transform hover:-translate-y-2 transition-all duration-500 ease-out"
                        >
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Icon */}
                            <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center mb-6 group-hover:bg-zinc-700/80 transition-colors duration-300">
                                <feature.icon className="w-6 h-6 text-blue-400" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="container mx-auto px-4 py-16">
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

            {/* Benefits */}
            <section className="container mx-auto px-4 py-16">
                <div className="bg-zinc-900/50 rounded-3xl p-8 sm:p-12 border border-zinc-800/50 backdrop-blur-sm">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Why Use This
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Simple benefits for Farcaster users who own NFTs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-zinc-800/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <benefit.icon className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-zinc-900/30 rounded-3xl p-8 sm:p-12 border border-zinc-800/30 backdrop-blur-sm">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                                About This Project
                            </h2>
                            <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                                We noticed that selling NFTs often requires jumping between
                                different platforms and apps. Since many NFT owners are already
                                active on Farcaster, we built a simple Mini App to handle sales
                                directly within the platform.
                            </p>
                            <p className="text-zinc-400 leading-relaxed">
                                This is a new project, so we're starting simple and improving based
                                on what users actually need.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-16">
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
            <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-zinc-800/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">MiniMart</span>
                    </div>
                    {/**/}
                    {/* <div className="flex items-center gap-6 text-sm text-zinc-400"> */}
                    {/*     <a href="#" className="hover:text-white transition-colors duration-200"> */}
                    {/*         Privacy */}
                    {/*     </a> */}
                    {/*     <a href="#" className="hover:text-white transition-colors duration-200"> */}
                    {/*         Terms */}
                    {/*     </a> */}
                    {/*     <a href="#" className="hover:text-white transition-colors duration-200"> */}
                    {/*         Support */}
                    {/*     </a> */}
                    {/* </div> */}
                </div>
            </footer>
        </div>
    );
}

