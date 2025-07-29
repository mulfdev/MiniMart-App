import type { PropsWithChildren } from 'react';

const CardLinkWrapper = ({ children }: PropsWithChildren) => {
    return <>{children}</>;
};

export function NftCardSkeleton() {
    return (
        <CardLinkWrapper>
            <div className="group relative w-80 h-96 perspective-1000">
                {/* outer glow chassis */}
                <div
                    className={`absolute inset-0
                        bg-[radial-gradient(ellipse_at_50%_-20%,_#5B22E5_0%,_#21B9CE_12%,_transparent_26%)]
                        rounded-2xl opacity-10 blur-2xl`}
                />

                <div
                    className={`relative w-full h-full`}
                >
                    {/* icy glass card body */}
                    <div
                        className="absolute inset-0
                            [background:linear-gradient(145deg,rgba(8,19,35,0.35),rgba(18,26,46,0.1))]
                            backdrop-blur-xl border border-cyan-300/25 rounded-2xl
                            shadow-[0_8px_14px_rgba(0,200,255,.06)]"
                    />

                    {/* holo border (new) */}
                    <div
                        className="absolute inset-0 rounded-2xl
                            [background:linear-gradient(120deg,#0891B2,transparent,#0891B2)]
                            opacity-0 p-0.5"
                    />

                    {/* inner plating (bevel) */}
                    <div
                        className="absolute rounded-2xl
                            [background:linear-gradient(115deg,#04101A,#02131F)]"
                    />

                    {/* content */}
                    <div className="relative z-10 p-5 h-full flex flex-col justify-between animate-pulse">
                        {/* image */}
                        <div
                            className="relative -mx-[1px] -mt-[1px] rounded-t-2xl overflow-hidden
                                flex-1"
                        >
                            <div className="w-full h-full bg-slate-700/50 rounded-t-2xl" />
                        </div>

                        {/* footer */}
                        <div className="pt-4 space-y-3">
                            <div className="h-4 bg-slate-700/50 rounded w-3/4" />

                            <div className="h-12 bg-slate-700/50 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </CardLinkWrapper>
    );
}