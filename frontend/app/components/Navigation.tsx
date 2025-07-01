import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLocation } from 'react-router';
import { MobileBackButton } from './MobileBackButton';
import { Hamburger } from './Hamburger';
import { Sidebar } from './Sidebar';

export function Navigation() {
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [oldPath, setOldPath] = useState('');
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        setSidebarOpen(() => (oldPath !== location.pathname ? false : true));
        setOldPath(location.pathname);
    }, [location.pathname]);

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
                <div className="flex items-center gap-4">
                    <Hamburger
                        isOpen={isSidebarOpen}
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="text-white"
                    />
                </div>
            </nav>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </header>
    );
}
