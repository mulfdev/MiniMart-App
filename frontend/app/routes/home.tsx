import { ArrowRight, Zap, Shield, Users, Sparkles, Smartphone, Clock, Globe } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { NftCard } from '~/components/NftCard';
import { NftCardSkeleton } from '~/components/NftCardSkeleton';
import type { Nft } from '@minimart/types';
import { API_URL } from '~/root';
import { useNavigate } from 'react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { set, get } from '~/cache';

async function fetchOrders() {
    try {
        const response = await fetch(`${API_URL}/all-orders`);
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

export async function clientLoader() {
    const data = await fetchOrders();
    set({ key: 'frontpageOrders', value: data, ttl: 120_000 });
}

function OpenListings() {
    const [nfts, _] = useState(() => {
        const data = get('frontpageOrders') as Nft[];
        return data;
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
            <section className="max-w-7xl mx-auto px-4 py-12">
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
