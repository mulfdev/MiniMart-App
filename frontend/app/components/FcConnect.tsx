import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useConnect } from 'wagmi';

export default function FcConnect() {
    const { connect, connectors } = useConnect();

    async function loadFcSDK() {
        const isMiniApp = await sdk.isInMiniApp();

        await sdk.actions.ready({ disableNativeGestures: true });
        if (isMiniApp) {
            connect({ connector: connectors[0] });
        }
    }

    useEffect(() => {
        loadFcSDK().catch((err) => console.log(err));
    }, []);

    return null;
}
