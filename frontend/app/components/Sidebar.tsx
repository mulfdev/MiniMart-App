import { lazy, type JSX, useRef } from 'react';
import { Home, Shapes, NotebookTabs, Logs, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router';
import { useAccount } from 'wagmi';
import { useOnClickOutside } from '~/hooks/useOnClickOutside';

const ConnectButton = lazy(() => import('./ConnectButton'));

function SidebarLink({
    url,
    label,
    icon,
    onClick,
}: {
    url: string;
    label: string;
    icon: JSX.Element;
    onClick: () => void;
}) {
    return (
        <Link
            to={url}
            onClick={onClick}
            className="flex items-center gap-x-3 rounded-lg border border-slate-700/50
                bg-slate-800/60 backdrop-blur-sm px-4 py-3 text-base font-semibold text-slate-100
                transition-all duration-200 ease-in-out hover:bg-slate-700/70
                hover:border-blue-600/30 hover:shadow-lg hover:shadow-blue-500/10
                active:bg-slate-600/80 active:border-blue-500/40"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

function NavContent({ onClose }: { onClose: () => void }) {
    const { address } = useAccount();

    return (
        <div className="pt-2 flex flex-col gap-y-4 h-full">
            <SidebarLink
                url="/"
                label="Home"
                icon={<Home className="h-6 w-6 text-slate-400" />}
                onClick={onClose}
            />
            <SidebarLink
                url="/collections"
                label="Collections"
                icon={<LayoutGrid className="h-6 w-6 text-slate-400" />}
                onClick={onClose}
            />
            {address && (
                <>
                    <SidebarLink
                        url={`/user/${address}`}
                        label="Your Tokens"
                        icon={<Shapes className="h-6 w-6 text-slate-400" />}
                        onClick={onClose}
                    />
                    <SidebarLink
                        url={`/user/listings/${address}`}
                        label="Your Listings"
                        icon={<NotebookTabs className="h-6 w-6 text-slate-400" />}
                        onClick={onClose}
                    />
                    <SidebarLink
                        url="/orders"
                        label="All Orders"
                        icon={<Logs className="h-6 w-6 text-slate-400" />}
                        onClick={onClose}
                    />
                </>
            )}
            <span className="mt-auto">
                <ConnectButton />
            </span>
        </div>
    );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useOnClickOutside(ref, onClose);

    return (
        <div
            ref={ref}
            className={`fixed top-0 right-0 z-30 rounded-lg transition-transform duration-100
                ease-in-out h-[100svh] w-64 p-6 pb-8 ${
                    isOpen
                        ? 'translate-x-0 visibility-visible'
                        : 'translate-x-full visibility-hidden'
                }`}
            style={{
                backgroundColor: 'rgba(3, 3, 9, 0.85)',
                backdropFilter: 'blur(12px)',
                backgroundImage: [
                    'radial-gradient(ellipse 150% 100% at 50% 0%, rgba(22, 40, 65, 0.4) 0%, rgba(26, 60, 95, 0.2) 25%, rgba(15, 30, 53, 0.1) 50%, transparent 80%)',
                    'radial-gradient(ellipse 200% 150% at 80% 100%, rgba(10, 26, 45, 0.3) 0%, rgba(5, 18, 34, 0.1) 40%, transparent 70%)',
                ].join(','),
                backgroundSize: 'cover, cover',
                backgroundPosition: '50% 0%, 80% 100%',
                boxShadow:
                    'inset 0 0 60px rgba(6, 20, 40, 0.2), inset 0 0 15px rgba(21, 93, 255, 0.05), 0 0 40px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
            }}
        >
            <NavContent onClose={onClose} />
        </div>
    );
}
