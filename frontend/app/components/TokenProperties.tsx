import type { Nft } from '@minimart/types';
import { ExternalLink, Shield, Hash, FileText, Fingerprint } from 'lucide-react';

export function TokenProperties({ nft }: { nft: Nft }) {
    const properties = [
        {
            icon: Fingerprint,
            label: 'Contract Address',
            value: nft.contract.address,
            isAddress: true,
        },
        {
            icon: Hash,
            label: 'Token ID',
            value: nft.tokenId,
        },
        {
            icon: Shield,
            label: 'Token Standard',
            value: nft.contract.tokenType,
        },
        {
            icon: FileText,
            label: 'Symbol',
            value: nft.contract.symbol,
        },
    ];

    return (
        <div className="flex flex-col mt-6">
            <div className="order-last lg:order-first">
                <h2 className="text-xl font-semibold text-white mb-4">Properties</h2>
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                    {properties.map((prop) => (
                        <div
                            key={prop.label}
                            className="bg-slate-900/70 border border-sky-800/80
                                                rounded-xl p-4"
                        >
                            <div className="flex items-center gap-3">
                                <prop.icon className="w-5 h-5 text-zinc-500" />
                                <div>
                                    <p className="text-sm text-zinc-400">{prop.label}</p>
                                    {prop.isAddress ? (
                                        <a
                                            href={`https://basescan.org/address/${prop.value}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-sm
                                                                text-zinc-300 break-all
                                                                hover:text-sky-400 transition-colors
                                                                duration-200 flex items-center
                                                                gap-1"
                                        >
                                            <span>{`${prop.value.slice(
                                                0,
                                                6
                                            )}...${prop.value.slice(-6)}`}</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <p
                                            className="font-mono text-sm
                                                                text-zinc-300 break-all"
                                        >
                                            {prop.value}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
