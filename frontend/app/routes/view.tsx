import { ErrorBoundary } from '~/components/ErrorBoundary';
import type { Route } from './+types/view';
import { useAccount } from 'wagmi';
import { fetchNfts } from '~/loaders';
import { useCache, primeCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';
import { Loader } from '~/components/Loader';
import { Page, NftGrid } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';

export function clientLoader({ params }: Route.ClientLoaderArgs) {
    primeCache(cacheKeys.nfts(params.address), () => fetchNfts(params.address), {
        ttl: 120_000,
    });
    return null;
}

export function Fallback() {
    return <Loader className="h-20 w-20" text="Loading your NFT collection..." />;
}

function ViewNftsContent({ address }: { address: `0x${string}` }) {
    const nfts = useCache(cacheKeys.nfts(address), () => fetchNfts(address), {
        ttl: 120_000,
        enabled: !!address,
    });

    if (!nfts || nfts.length === 0) {
        return <EmptyState message="No listings found." />;
    }

    return <NftGrid nfts={nfts} />;
}

export default function ViewNfts() {
    const { address, isConnecting } = useAccount();

    if (isConnecting || !address) {
        return <Fallback />;
    }

    return (
        <Page
            title="Your Collection"
            description="Here are the NFTs you own. Select any NFT to create a listing."
        >
            <ErrorBoundary>
                <Suspense fallback={<Fallback />}>
                    <ViewNftsContent address={address} />
                </Suspense>
            </ErrorBoundary>
        </Page>
    );
}
