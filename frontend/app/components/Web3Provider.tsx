import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { wagmiConfig } from '~/config';
import { useEffect, useState } from 'react'; // Import useEffect and useState

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider
                    options={{
                        language: 'en-US',
                    }}
                >
                    {isMounted ? children : null}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
