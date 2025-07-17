import { ErrorBoundary } from '~/components/ErrorBoundary';
import type { Route } from './+types/view';
import { fetchNfts } from '~/loaders';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { NftCard } from '~/components/NftCard';
import { useLoaderData } from 'react-router';
import { useState } from 'react';
import type { Nft } from '@minimart/types';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const nfts = await fetchNfts(params.address);
    return nfts;
}

function NftCardWrapper({ nft }: { nft: Nft }) {
    const [isVisible, setIsVisible] = useState(true);

    const handleImageError = () => {
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div key={`${nft.contract.address}+${nft.tokenId}`}>
            <NftCard nft={nft} variant="list" onImageError={handleImageError} />
        </div>
    );
}

function ViewNftsContent() {
    const data = useLoaderData<typeof clientLoader>();
    if (!data || !data.nfts || data.nfts.length === 0) {
        return <EmptyState message="No listings found." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center gap-8">
            {data.nfts.map((nft) => (
                <NftCardWrapper nft={nft} />
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
