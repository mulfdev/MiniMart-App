import { useEffect } from 'react';

import sdk from '@farcaster/frame-sdk';
import { useConnect } from 'wagmi';

export default function FcConnect() {
    const { connect, connectors } = useConnect();

    async function loadFcSDK() {
        const isMiniApp = await sdk.isInMiniApp();

        if (isMiniApp) {
            connect({ connector: connectors[0] });
            await sdk.actions.ready({ disableNativeGestures: true });
        }
    }

    useEffect(() => {
        loadFcSDK().catch((err) => console.log(err));
    }, []);

    return null;
}
