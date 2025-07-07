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
    return <Loader text="Loading your NFT collection..." />;
}

function ViewNftsContent({ address }: { address: `0x${string}` }) {
    const nfts = useCache(cacheKeys.nfts(address), () => fetchNfts(address), {
        ttl: 120_000,
        enabled: !!address,
    });

    if (!nfts) {
        return <Loader text="Loading your NFT collection..." />;
    }

    return (
        <Page
            title="Your Collection"
            description="Here are the NFTs you own. Select any NFT to create a listing."
        >
            {nfts.length > 0 ? (
                <NftGrid nfts={nfts} />
            ) : (
                <EmptyState message="No NFTs found in your collection" />
            )}
        </Page>
    );
}

export default function ViewNfts() {
    const { address, isConnecting } = useAccount();

    if (isConnecting || !address) {
        return <Fallback />;
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
                <ViewNftsContent address={address} />
            </Suspense>
        </ErrorBoundary>
    );
}
