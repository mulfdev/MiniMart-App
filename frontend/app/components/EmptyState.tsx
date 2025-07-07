import { Sparkles } from 'lucide-react';

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">{message}</p>
        </div>
    );
}
