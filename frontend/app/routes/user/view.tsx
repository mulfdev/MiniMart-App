import { ErrorBoundary } from '~/components/ErrorBoundary';
import type { Route } from './+types/view';
import { fetchNfts } from '~/loaders';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { NftCard } from '~/components/NftCard';
import { useLoaderData } from 'react-router';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const nfts = await fetchNfts(params.address);
    return nfts;
}

function ViewNftsContent() {
    const data = useLoaderData<typeof clientLoader>();
    if (!data || !data.nfts || data.nfts.length === 0) {
        return <EmptyState message="No listings found." />;
    }

    return (
        <div
            className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start
                items-center gap-8 mb-22"
        >
            {data.nfts.map((nft) => (
                <div key={`${nft.contract.address}+${nft.tokenId}`}>
                    <NftCard nft={nft} variant="list" />
                </div>
            ))}
        </div>
    );
}

export default function ViewNfts() {
    return (
        <Page
            title="Your Collection"
            description="Here are the NFTs you own. Select any NFT to create a listing."
        >
            <ErrorBoundary>
                <ViewNftsContent />
            </ErrorBoundary>
        </Page>
    );
}
