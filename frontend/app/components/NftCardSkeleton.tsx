export function NftCardSkeleton() {
    return (
        <div
            className="group relative bg-zinc-900 rounded-2xl p-4 border border-zinc-800/50
                animate-pulse"
        >
            <div className="aspect-square bg-zinc-800 rounded-lg mb-4"></div>
            <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
        </div>
    );
}
