import { LoadingSpinner } from './LoadingSpinner';

export function Loader({ text }: { text: string }) {
    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 sm:py-16">
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <LoadingSpinner />
                    <p className="text-zinc-400 font-medium">{text}</p>
                </div>
            </main>
        </div>
    );
}
