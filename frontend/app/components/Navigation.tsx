import { Sparkles } from 'lucide-react';

export function Navigation() {
    return (
        <header className="container mx-auto px-4 py-6">
            <nav className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">MiniMart</span>
                </div>
            </nav>
        </header>
    );
}
