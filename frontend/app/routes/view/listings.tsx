import { useQuery } from '@tanstack/react-query';
import { queryClient } from '~/root';
import { useAccount } from 'wagmi';
import type { Route } from '../+types/view';
import { fetchOrders } from '~/loaders';

export function clientLoader({ params }: Route.LoaderArgs) {
    const { address } = params;
    queryClient.prefetchQuery({
        queryKey: ['listings'],
        queryFn: () => fetchOrders(address),
    });
    return null;
}

export function HydrateFallback() {
    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                {/* Loading State */}
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                    </div>
                    <p className="text-zinc-400 font-medium">Loading your listings</p>
                </div>
            </main>
        </div>
    );
}

export default function () {
    const account = useAccount();
    const {
        data: listings,
        isPending,
        isError,
    } = useQuery({
        queryKey: ['listngs'],
        queryFn: async () => {
            const nfts = await fetchOrders(account.address!);
            return nfts;
        },
        enabled: account.address !== undefined,
        staleTime: 240_000,
    });

    if (isPending) return <HydrateFallback />;
    return (
        <div className="max-w-7xl mx-auto">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Your Listings
                    </h1>
                </div>
            </main>
        </div>
    );
}
