import type { Route } from '../+types/view';
import { fetchUserOrders } from '~/loaders';
import { useParams } from 'react-router';
import { primeCache, useCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';
import { Loader } from '~/components/Loader';
import { Page, NftGrid } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';

export function clientLoader({ params }: Route.LoaderArgs) {
    const { address } = params;
    primeCache(cacheKeys.listings(address), () => fetchUserOrders(address), { ttl: 120_000 });
}

export function HydrateFallback() {
    return <Loader text="Loading your listings..." />;
}

function Listings() {
    const params = useParams();
    const nfts = useCache(cacheKeys.listings(params.address!), () => fetchUserOrders(params.address!), {
        ttl: 120_000,
        enabled: !!params.address,
    });

    if (!nfts) {
        return <Loader text="Loading your listings..." />;
    }

    if (nfts.length === 0) {
        return <EmptyState message="No listings found." />;
    }

    return <NftGrid nfts={nfts} variant="remove" />;
}

export default function UserListings() {
    return (
        <Page title="Your Listings" description="Manage your active NFT listings.">
            <Suspense fallback={<HydrateFallback />}>
                <Listings />
            </Suspense>
        </Page>
    );
}
