import { LoadingSpinner } from './LoadingSpinner';

export function Loader({ text, className }: { text: string; className?: string }) {
    return (
        <div className="min-h-screen">
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <LoadingSpinner className={className} />
                <p className="text-zinc-400 font-medium">{text}</p>
            </div>
        </div>
    );
}
