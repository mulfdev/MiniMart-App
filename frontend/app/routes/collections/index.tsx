import { useLoaderData, Link } from 'react-router';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';
import { NftCardSkeleton } from '~/components/NftCardSkeleton';
import { Suspense } from 'react';

interface Collection {
    contractAddress: string;
    name: string;
    image: string;
    description: string;
}

export async function clientLoader() {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${backendUrl}/collections`);

    if (!res.ok) {
        throw new Error('Failed to load collections');
    }

    const { collections } = await res.json();
    return { collections };
}

export default function CollectionsPage() {
    const { collections } = useLoaderData<typeof clientLoader>();

    return (
        <Page>
            <div className="flex flex-col items-center justify-center w-full">
                <h1 className="text-4xl font-bold text-white mb-8">Browse Collections</h1>
                {collections.length === 0 ? (
                    <EmptyState message="No collections with active listings found." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 w-full max-w-6xl">
                        <Suspense fallback={<NftCardSkeleton />}>
                            {collections.map((collection: Collection) => (
                                <CollectionCard key={collection.contractAddress} collection={collection} />
                            ))}
                        </Suspense>
                    </div>
                )}
            </div>
        </Page>
    );
}

interface CollectionCardProps {
    collection: Collection;
}

function CollectionCard({ collection }: CollectionCardProps) {
    return (
        <Link to={`/collections/${collection.contractAddress}`} className="block">
            <div className="bg-zinc-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:ring-1 hover:ring-blue-500">
                <div className="w-full h-48 bg-zinc-700 flex items-center justify-center overflow-hidden">
                    {collection.image && (
                        <img
                            src={collection.image}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/placeholder-collection.svg'; // Fallback image
                            }}
                        />
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-white text-lg font-semibold truncate">{collection.name}</h3>
                    <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{collection.description || 'No description available.'}</p>
                </div>
            </div>
        </Link>
    );
}
