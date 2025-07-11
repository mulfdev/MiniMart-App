import { ErrorBoundary } from '~/components/ErrorBoundary';
import type { Route } from './+types/view';
import { useAccount } from 'wagmi';
import { fetchNfts } from '~/loaders';
import { useCache, primeCache, cacheKeys } from '~/hooks/useCache';
import { Suspense } from 'react';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { NftCard } from '~/components/NftCard';

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
    const data = useCache(cacheKeys.nfts(address), () => fetchNfts(address), {
        ttl: 120_000,
        enabled: !!address,
    });

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
                    <NftCard nft={nft} variant="list" />
                </div>
            ))}
        </div>
    );
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
