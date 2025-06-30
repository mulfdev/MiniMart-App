import { useEffect } from 'react';
import { ConnectKitButton } from 'connectkit';
import { Sparkles } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';
import { useLocation } from 'react-router';
import { MobileBackButton } from './MobileBackButton';

export function Navigation() {
    const location = useLocation();
    let isMiniApp = null;
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        sdk.isInMiniApp()
            .then((data) => (isMiniApp = data))
            .catch((err) => console.log(err));
    }, []);
    return (
        <header className="mx-auto px-4 py-3 md:px-8 md:py-6 h-[64px] md:h-[88px]">
            <nav className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="lg:hidden">
                        {isHomePage ? (
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        ) : (
                            <MobileBackButton className="text-white" />
                        )}
                    </div>
                    <div className="hidden lg:flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">MiniMart</span>
                    </div>
                    <span className="lg:hidden text-xl font-bold text-white">
                        {isHomePage ? 'MiniMart' : ''}
                    </span>
                </div>
                {!isMiniApp ? <ConnectKitButton /> : null}
            </nav>
        </header>
    );
}
