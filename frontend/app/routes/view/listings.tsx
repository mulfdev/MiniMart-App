import type { Route } from '../+types/view';
import { fetchUserOrders } from '~/loaders';
import { useParams } from 'react-router';
import { primeCache, useCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { NftCard } from '~/components/NftCard';

export function clientLoader({ params }: Route.LoaderArgs) {
    const { address } = params;
    primeCache(cacheKeys.listings(address), () => fetchUserOrders(address), { ttl: 120_000 });
    return null;
}

function Listings() {
    const params = useParams();
    const data = useCache(
        cacheKeys.listings(params.address!),
        () => fetchUserOrders(params.address!),
        {
            ttl: 120_000,
            enabled: !!params.address,
        }
    );

    if (!data || data.nfts.length === 0) {
        return <EmptyState message="No listings found." />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-22">
            {data.nfts.map((nft) => (
                <div
                    key={`${nft.contract.address}+${nft.tokenId}`}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: '100ms' }}
                >
                    <NftCard nft={nft} variant="remove" />
                </div>
            ))}
        </div>
    );
}

export default function UserListings() {
    return (
        <Page title="Your Listings" description="Manage your active NFT listings.">
            <Suspense fallback={<Loader className="h-12 w-12" text="Loading your listings..." />}>
                <Listings />
            </Suspense>
        </Page>
    );
}
