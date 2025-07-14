import type { Route } from '../+types/view';
import { fetchUserOrders } from '~/loaders';
import { useLoaderData, useParams } from 'react-router';
import { Loader } from '~/components/Loader';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { NftCard } from '~/components/NftCard';

export async function clientLoader({ params }: Route.LoaderArgs) {
    const listings = fetchUserOrders(params.address);
    return listings;
}

function Listings() {
    const data = useLoaderData<typeof clientLoader>();
    if (!data || data.nfts.length === 0) {
        return <EmptyState message="No listings found." />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-22">
            {data.nfts.map((nft) => (
                <div key={`${nft.contract.address}+${nft.tokenId}`}>
                    <NftCard nft={nft} variant="remove" />
                </div>
            ))}
        </div>
    );
}

export default function UserListings() {
    return (
        <Page title="Your Listings" description="Manage your active NFT listings.">
            <Listings />
        </Page>
    );
}
