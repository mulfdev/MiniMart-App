export function Page({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-7xl mx-auto px-8 pb-20">
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 my-8">{title}</h1>
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{description}</p>
            </div>
            {children}
        </div>
    );
}
