import { ConnectKitButton } from 'connectkit';
import { Home, Shapes, NotebookTabs, Logs } from 'lucide-react';
import { useEffect, useRef, useState, type JSX } from 'react';
import sdk from '@farcaster/frame-sdk';
import { Link } from 'react-router';
import { useAccount } from 'wagmi';
import { useOnClickOutside } from '~/hooks/useOnClickOutside';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const { address } = useAccount();
    useOnClickOutside(ref, onClose);

    const [isMiniApp, setIsMiniApp] = useState(false);
    useEffect(() => {
        (async () => {
            await sdk.actions.ready();
        })();
        sdk.isInMiniApp()
            .then((data) => setIsMiniApp(data))
            .catch((err) => console.log(err));
    }, []);

    console.log(isMiniApp);

    function SidebarLink({ url, label, icon }: { url: string; label: string; icon: JSX.Element }) {
        return (
            <Link
                to={url}
                className="flex items-center gap-x-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-base font-semibold text-zinc-100 transition-colors duration-150 hover:bg-zinc-700 active:bg-zinc-600"
            >
                {icon}
                <span>{label}</span>
            </Link>
        );
    }

    return (
        <div
            ref={ref}
            className={`fixed top-0 right-0 h-[100svh] bg-zinc-900/80 backdrop-blur-sm z-40 rounded-lg transition-transform duration-100 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            } w-64 p-4`}
        >
            {isMiniApp ? null : <ConnectKitButton />}

            <div className="my-8 flex flex-col gap-y-3">
                <SidebarLink
                    url="/"
                    label="Home"
                    icon={<Home className="h-6 w-6 text-zinc-400" />}
                />
                <SidebarLink
                    url={address ? `/user/${address}` : `/`}
                    label="Your Tokens"
                    icon={<Shapes className="h-6 w-6 text-zinc-400" />}
                />
                <SidebarLink
                    url={address ? `/user/listings/${address}` : `/`}
                    label="Your Listings"
                    icon={<NotebookTabs className="h-6 w-6 text-zinc-400" />}
                />
                <SidebarLink
                    url="/orders"
                    label="All Orders"
                    icon={<Logs className="h-6 w-6 text-zinc-400" />}
                />
            </div>
        </div>
    );
}
