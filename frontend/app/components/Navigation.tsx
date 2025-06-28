import { useEffect } from 'react';
import { ConnectKitButton } from 'connectkit';
import { Sparkles } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

export function Navigation() {
    let isMiniApp = null;

    useEffect(() => {
        sdk.isInMiniApp()
            .then((data) => (isMiniApp = data))
            .catch((err) => console.log(err));
    }, []);
    return (
        <header className="mx-auto px-4 py-3 md:px-8 md:py-6">
            <nav className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">MiniMart</span>
                </div>
                {!isMiniApp ? <ConnectKitButton /> : null}
            </nav>
        </header>
    );
}
