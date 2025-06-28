import { Navigation } from '~/components/Navigation';
import type { Nft } from '@minimart/types';
import { NftCard } from '~/components/NftCard';
import { Sparkles } from 'lucide-react';
import type { Route } from './+types/view';
import { ALCHEMY_API_KEY, queryClient } from '~/root';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

async function fetchNfts(address: string) {
    if (address.length !== 42 && !address.startsWith('0x'))
        return Promise.reject(new Error('Incorrect address'));

    try {
        const res = await fetch(
            `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=100`
        );

        if (!res.ok) throw new Error('Could not fetch NFTs');

        const data = await res.json();

        if (!data.ownedNfts || data.ownedNfts.length === 0) {
            return [];
        }

        const nfts = data.ownedNfts as Nft[];

        const noSpamNfts = nfts.filter((nft) => !nft.contract.isSpam);
        console.log('spam check \n', noSpamNfts);

        const erc721s = noSpamNfts.filter((nft) => nft.tokenType === 'ERC721') ?? [];

        console.log('first 721 check\n', erc721s);

        const erc721sWithImgs =
            erc721s.filter(
                (nft) =>
                    nft.tokenUri !== null || nft.tokenUri !== '' || nft.image.originalUrl !== null
            ) ?? [];

        console.log('with image check\n', erc721sWithImgs);

        return erc721sWithImgs ?? [];
    } catch (e) {
        throw new Error('Could not fetch NFTs');
    }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const result = await queryClient.ensureQueryData({
        queryKey: ['nfts'],
        queryFn: async () => {
            const nfts = await fetchNfts(params.address);
            return nfts;
        },
        staleTime: 240_000,
    });

    return result;
}

const backgroundStyle = {
    backgroundColor: '#0a0a0a',
    backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, hsla(220, 100%, 50%, 0.05), transparent),
            radial-gradient(ellipse 60% 80% at 80% 50%, hsla(280, 100%, 50%, 0.03), transparent),
            radial-gradient(ellipse 40% 60% at 20% 80%, hsla(300, 100%, 50%, 0.02), transparent),
            url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgb(255,255,255,0.02)"%3E%3Cpath d="M0 .5H31.5V32"/%3E%3C/svg%3E')
        `,
};

export function HydrateFallback() {
    return (
        <div className="min-h-screen" style={backgroundStyle}>
            <main className="container mx-auto px-4 py-8 sm:py-16">
                {/* Loading State */}
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                    </div>
                    <p className="text-zinc-400 font-medium">Loading your NFT collection...</p>
                </div>
            </main>
        </div>
    );
}

export default function ViewNfts() {
    const account = useAccount();

    console.log(account.address);
    const { data: nfts, isPending } = useQuery({
        queryKey: ['nfts'],
        queryFn: async () => {
            const nfts = await fetchNfts(account.address!);
            return nfts;
        },
        enabled: account.address !== undefined,
        staleTime: 240_000,
    });

    if (isPending) return <HydrateFallback />;

    return (
        <div className="min-h-screen" style={backgroundStyle}>
            <Navigation />
            <main className="container mx-auto px-4 py-8 sm:py-16">
                {/* Error State */}
                {/* {error && ( */}
                {/*     <div className="text-center py-20"> */}
                {/*         <div */}
                {/*             className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20  */}
                {/*                       rounded-lg text-red-400 backdrop-blur-sm" */}
                {/*         > */}
                {/*             <span>Error fetching NFTs: {error.message}</span> */}
                {/*         </div> */}
                {/*     </div> */}
                {/* )} */}
                {/**/}
                {/* NFT Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {nfts &&
                        nfts.map((nft, index) => (
                            <div
                                key={`${nft.contract.address}+${nft.tokenId}`}
                                className="animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <NftCard nft={nft} />
                            </div>
                        ))}
                </div>

                {/* Empty State */}
                {nfts && nfts.length === 0 && (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-16 h-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-8 h-8 text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium">
                            No NFTs found in your collection collection
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
