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
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{description}</p>
                </div>
                {children}
            </main>
        </div>
    );
}
