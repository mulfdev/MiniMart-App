import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';

export const BASE_RPC_URL = import.meta.env.VITE_BASE_RPC_URL;

if (typeof BASE_RPC_URL !== 'string') {
    throw new Error('BASE_RPC_URL must be set');
}

export const wagmiConfig = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(BASE_RPC_URL),
    },
    connectors: [miniAppConnector()],
});
