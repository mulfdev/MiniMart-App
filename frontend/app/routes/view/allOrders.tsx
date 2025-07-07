import { ErrorBoundary } from '~/components/ErrorBoundary';
import { fetchAllOrders } from '~/loaders';
import { useCache, primeCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';
import type { Nft } from '@minimart/types';
import { Loader } from '~/components/Loader';
import { Page, NftGrid } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';

export function clientLoader() {
    primeCache(cacheKeys.homepageOrders, () => fetchAllOrders(), {
        ttl: 120_000,
    });
    return null;
}

export function Fallback() {
    return <Loader text="Loading all orders..." />;
}

function AllOrdersContent() {
    const nfts = useCache(cacheKeys.homepageOrders, () => fetchAllOrders(), {
        ttl: 120_000,
    });

    if (!nfts) {
        return <Loader text="Loading all orders..." />;
    }

    return (
        <Page
            title="All Orders"
            description="Browse all the NFTs listed for sale across the platform."
        >
            {nfts.length > 0 ? (
                <NftGrid nfts={nfts} variant="view" />
            ) : (
                <EmptyState message="No orders found." />
            )}
        </Page>
    );
}

export default function AllOrders() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
                <AllOrdersContent />
            </Suspense>
        </ErrorBoundary>
    );
}
