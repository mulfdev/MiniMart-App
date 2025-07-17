import { useLoaderData, Link } from 'react-router';
import { Page } from '~/components/Page';
import { EmptyState } from '~/components/EmptyState';

interface Collection {
    contractAddress: string;
    name: string;
    image: string;
    description: string;
}

interface CollectionBannerProps {
    collection: Collection;
    index: number;
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
        <Page title="Browse Collections" description="An evolving gallery of unique collections">
            {collections.length === 0 ? (
                <EmptyState message="No collections with active listings found." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {collections.map((collection: Collection, index: number) => (
                        <CollectionBanner
                            key={collection.contractAddress}
                            collection={collection}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </Page>
    );
}

function CollectionBanner({ collection, index }: CollectionBannerProps) {
    return (
        <Link
            to={`/collections/${collection.contractAddress}`}
            className="block group relative overflow-hidden rounded-2xl h-80 animate-slide-up-fade"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Background Image */}
            <img
                src={collection.image || '/placeholder-collection.svg'}
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform
                    duration-500 ease-in-out group-hover:scale-105"
                onError={(e) => {
                    e.currentTarget.src = '/placeholder-collection.svg';
                }}
            />

            {/* Gradient Overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40
                    to-transparent"
            />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{collection.name}</h3>
                <p className="text-zinc-200 text-sm mt-2 line-clamp-2 drop-shadow-md max-w-lg">
                    {collection.description || ''}
                </p>
            </div>

            {/* Hover Ring */}
            <div
                className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10
                    group-hover:ring-blue-400 transition-all duration-300"
            />
        </Link>
    );
}
