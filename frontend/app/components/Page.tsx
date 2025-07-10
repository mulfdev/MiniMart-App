import type { Nft, OrderListed } from '@minimart/types';
import { NftCard } from './NftCard';

export function Page({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-7xl mx-auto">
            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{description}</p>
                </div>
                {children}
            </main>
        </div>
    );
}

export function NftGrid({
    nfts,
    variant,
}: {
    nfts: { nft: Nft; orderInfo: OrderListed }[];
    variant?: 'view' | 'remove';
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-22">
            {nfts.map(({ nft }, index) => (
                <div
                    key={`${nft.contract.address}+${nft.tokenId}`}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <NftCard nft={nft} variant={variant} />
                </div>
            ))}
        </div>
    );
}
