import type { Nft } from '@minimart/types';
import React from 'react';

export function TokenPageLayout({
    nft,
    children,
}: {
    nft: Nft;
    children: React.ReactNode;
}) {
    return (
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
            <div
                className="lg:w-2/3 h-1/2 lg:h-[calc(100svh-64px)] flex items-center justify-center
                    relative"
            >
                <div className="w-full h-full relative">
                    <div className="relative h-full bg-transparent">
                        <div className="absolute inset-0 md:overflow-hidden">
                            <img
                                src={
                                    nft.image.originalUrl ||
                                    nft.tokenUri ||
                                    '/placeholder.svg'
                                }
                                alt=""
                                className="w-full h-full object-cover scale-110 blur-xl opacity-30"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img
                                src={
                                    nft.image.originalUrl ||
                                    nft.tokenUri ||
                                    '/placeholder.svg'
                                }
                                className="max-w-full max-h-full object-contain transform
                                    transition-transform duration-700 ease-out drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:w-1/3">
                <div className="mx-auto w-full px-8">
                    <div className="flex flex-col pt-8 pb-20 sm:py-0">{children}</div>
                </div>
            </div>
        </div>
    );
}
