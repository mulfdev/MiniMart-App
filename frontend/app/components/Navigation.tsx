import { useEffect, useState } from 'react';
import { Menu, Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router';
import { MobileBackButton } from './MobileBackButton';
import { Hamburger } from './Hamburger';
import { Sidebar } from './Sidebar';

export function Navigation() {
    const { pathname } = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const isHomePage = pathname === '/';

    useEffect(() => {
        if (isSidebarOpen) {
            setSidebarOpen(false);
        }
    }, [pathname]);

    return (
        <header className="mx-auto px-4 py-3 h-[64px] fixed w-full top-0 bg-zinc-900/40 backdrop-blur-sm z-20">
            <nav className="flex justify-between items-center">
                <div className="flex items-end gap-2">
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
                <div className={`${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <Menu onClick={() => setSidebarOpen(true)} className="w-9 h-9" />
                </div>
            </nav>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </header>
    );
}
