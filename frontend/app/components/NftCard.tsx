import { Shield, Sparkles, Tag } from 'lucide-react';
import type { Nft, OrderListed } from '@minimart/types';
import { Link, useRevalidator, useSubmit } from 'react-router';
import { miniMartAddr } from '~/utils';
import { Toast } from './Toast';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '~/config';
import minimartAbi from '~/minimartAbi';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { fetchAllOrders, fetchNfts, fetchUserOrders } from '~/loaders';

export function NftCard({
    nft,
    orderInfo,
    variant = 'list',
}: {
    nft: Nft;
    orderInfo?: OrderListed;
    variant?: 'list' | 'view' | 'remove';
}) {
    const { address } = useAccount();
    const [inProgress, setInProgress] = useState(false);
    const [isSuccess, setIsSucess] = useState<boolean | null>(null);
    const [isError, setIsError] = useState<boolean | null>(null);

    const revalidator = useRevalidator();

    async function removeOrder() {
        try {
            setInProgress(true);
            if (!nft.orderId) {
                return;
            }
            const simulateTx = await simulateContract(wagmiConfig, {
                abi: minimartAbi,
                address: miniMartAddr,
                functionName: 'removeOrder',
                args: [nft.orderId as `0x${string}`],
            });
            if (!simulateTx.request) {
                throw new Error('Transaction simulation failed');
            }
            const txHash = await writeContract(wagmiConfig, simulateTx.request);
            await waitForTransactionReceipt(wagmiConfig, { hash: txHash, confirmations: 5 });

            setIsSucess(true);

            fetchNfts(address!, true);
            await fetchAllOrders(true);
            await fetchUserOrders(address!, true);
            revalidator.revalidate();
        } catch (e) {
            setIsError(true);
        } finally {
            setInProgress(false);
        }
    }

    return (
        <div className={`group relative ${isSuccess ? 'invisible' : 'visible'}`}>
            {/* Main Card Container */}
            <div
                className="relative bg-zinc-900 rounded-2xl overflow-hidden 
                        h-[530px] max- flex flex-col
                        shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                        hover:shadow-[0_20px_60px_rgb(0,0,0,0.3)]
                        transform hover:-translate-y-2 
                        transition-all duration-500 ease-out
                        border border-zinc-800/50 hover:border-zinc-700/80"
            >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Enhanced Image Container with artistic background */}
                <div className="relative overflow-hidden h-[320px] bg-zinc-800">
                    {/* Blurred background image for artistic effect */}
                    <div className="absolute inset-0">
                        <img
                            src={nft.image.originalUrl || nft.tokenUri || '/placeholder.svg'}
                            alt=""
                            className="w-full h-full object-cover scale-110 blur-xl opacity-30
                                     transform group-hover:scale-125 group-hover:opacity-40
                                     transition-all duration-700 ease-out"
                        />
                        {/* Overlay to darken the background */}
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    {/* Subtle pattern overlay for texture */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0 0h100v100H0z" fill="none"/%3E%3Cpath d="M0 0l100 100M100 0L0 100" stroke="white" strokeWidth="0.5" opacity="0.3"/%3E%3C/svg%3E')`,
                        }}
                    />

                    {/* Main image with object-contain */}
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={nft.image.originalUrl || nft.tokenUri || '/placeholder.svg'}
                            className="w-full h-full object-contain
                                     transform group-hover:scale-105 
                                     transition-transform duration-700 ease-out
                                     filter group-hover:brightness-110 group-hover:contrast-110
                                     drop-shadow-2xl rounded"
                        />
                    </div>

                    {/* Artistic light rays effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2">
                            <div className="absolute inset-0 bg-gradient-conic from-transparent via-white/5 to-transparent animate-spin-slow" />
                        </div>
                    </div>

                    {/* Shine effect sweep */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 
                                    bg-gradient-to-r from-transparent via-white/10 to-transparent
                                    transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                                    transition-transform duration-[1250ms] ease-out"
                    />

                    <div className="absolute inset-4 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Token standard badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <div
                            className="flex items-center gap-1 px-2 py-1 
                                      bg-black/70 backdrop-blur-sm rounded-full
                                      border border-white/20 shadow-lg"
                        >
                            <Shield className="w-3 h-3 text-blue-400" />
                            <span className="text-xs font-mono text-white/90 font-medium">
                                {nft.contract.tokenType.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 flex flex-col justify-between flex-1 relative">
                    {/* Decorative line with gradient */}
                    <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

                    {/* Top Text Section */}
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <h2
                                className="truncate text-lg sm:text-xl font-bold text-white leading-normal
                         group-hover:text-blue-100 transition-colors duration-300
                         drop-shadow-sm"
                            >
                                {nft.contract.name} #{nft.tokenId}
                            </h2>
                            <Sparkles
                                className="w-4 h-4 text-yellow-400/60 group-hover:text-yellow-400 
                               transition-all duration-300 flex-shrink-0 mt-1
                               group-hover:rotate-12 group-hover:scale-110"
                            />
                        </div>

                        <div className="">
                            {nft.description ? (
                                <p
                                    className="text-zinc-400 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3
                           group-hover:text-zinc-300 transition-colors duration-300"
                                >
                                    {nft.description}
                                </p>
                            ) : (
                                <p className="text-zinc-500 text-sm italic">
                                    A unique digital collectible
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="mt-4 sm:mt-6 pt-3 sm:pt-4 
                                  border-t border-gradient-to-r from-zinc-800/50 via-zinc-700/80 to-zinc-800/50
                                  transition-colors duration-300"
                    >
                        {orderInfo && (
                            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-2 mb-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-5 h-5 text-zinc-500" />
                                        <p className="text-sm text-zinc-400">Price</p>
                                    </div>
                                    <p className="font-mono text-xl text-white font-bold">
                                        ${formatEther(BigInt(orderInfo.price))} ETH
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center gap-2">
                            {variant === 'list' ? (
                                <Link to={`/list/${nft.contract.address}/${nft.tokenId}`}>
                                    <button
                                        className="group/link flex items-center gap-2 px-6 py-2.5 
                                             bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 hover:from-zinc-700/80 hover:to-zinc-600/80
                                             border border-zinc-700/50 hover:border-zinc-600/80
                                             rounded-xl font-semibold text-white text-lg
                                             transform hover:scale-105 active:scale-95
                                             transition-all duration-200 ease-out
                                             shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
                                    >
                                        List It
                                    </button>
                                </Link>
                            ) : null}
                            {variant === 'view' ? (
                                <Link to={`/token/${nft.contract.address}/${nft.tokenId}`}>
                                    <button
                                        className="group/link flex items-center gap-2 px-6 py-2.5 
                                             bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 hover:from-zinc-700/80 hover:to-zinc-600/80
                                             border border-zinc-700/50 hover:border-zinc-600/80
                                             rounded-xl font-semibold text-white text-lg
                                             transform hover:scale-105 active:scale-95
                                             transition-all duration-200 ease-out
                                             shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
                                    >
                                        View
                                    </button>
                                </Link>
                            ) : null}
                            {variant === 'remove' ? (
                                <button
                                    onClick={async () => {
                                        await removeOrder();
                                    }}
                                    disabled={inProgress}
                                    className="group/link flex items-center gap-2 px-6 py-2.5 
                                             bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 hover:from-zinc-700/80 hover:to-zinc-600/80
                                             border border-zinc-700/50 hover:border-zinc-600/80
                                             rounded-xl font-semibold text-white text-lg
                                             transform hover:scale-105 active:scale-95
                                             transition-all duration-200 ease-out
                                             shadow-lg hover:shadow-xl hover:shadow-blue-500/10 
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {inProgress ? (
                                        <>
                                            <LoadingSpinner /> Removing
                                        </>
                                    ) : (
                                        'Remove'
                                    )}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
            {isSuccess ? (
                <Toast variant="success" message="Listing Removed" onClose={() => {}} />
            ) : null}
            {isError ? <Toast variant="error" message="Could not remove the listing" /> : null}
        </div>
    );
}
