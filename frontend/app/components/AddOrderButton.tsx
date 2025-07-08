import { useState } from 'react';
import { useAccount, useChainId, useSignTypedData, useWriteContract, usePublicClient } from 'wagmi';
import { type Address, zeroAddress } from 'viem';
import { miniMartAddr, ORDER_COMPONENTS } from '~/utils';
import minimartAbi from '~/minimartAbi';
import { cacheKeys, remove } from '~/hooks/useCache';
import { API_URL } from '~/root';

type Order = {
    seller: Address;
    price: bigint;
    nftContract: Address;
    expiration: bigint;
    taker: Address;
    nonce: bigint;
    tokenId: bigint;
};

export function AddOrderButton({ price, nftContract, tokenId, onSuccess, onError, ...props }: any) {
    const { address } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { signTypedDataAsync, isPending: signing } = useSignTypedData();
    const { writeContractAsync, isPending: writing } = useWriteContract();
    const [busy, setBusy] = useState(false);

    async function submit() {
        setBusy(true);
        if (!address || !publicClient) {
            onError?.(new Error('Client not ready.'));
            setBusy(false);
            return;
        }

        let currentNonce: bigint;
        try {
            const nonceResult = await publicClient.readContract({
                address: miniMartAddr,
                abi: minimartAbi,
                functionName: 'nonces',
                args: [address],
            });
            currentNonce = BigInt(nonceResult);
        } catch (err) {
            onError?.(new Error('Failed to fetch nonce.'));
            setBusy(false);
            return;
        }

        const msg: Order = {
            seller: address,
            price: BigInt(price),
            nftContract,
            expiration: 0n,
            taker: zeroAddress,
            nonce: currentNonce,
            tokenId: BigInt(tokenId),
        };
        const domain = { name: 'MiniMart', version: '1', chainId, verifyingContract: miniMartAddr };

        try {
            const sig = await signTypedDataAsync({
                domain,
                types: { Order: ORDER_COMPONENTS },
                primaryType: 'Order',
                message: msg,
            });
            await writeContractAsync({
                address: miniMartAddr,
                abi: minimartAbi,
                functionName: 'addOrder',
                args: [msg, sig],
            });
            remove(cacheKeys.listings(address));
            remove(cacheKeys.nfts(address));
            remove(cacheKeys.homepageOrders);
            fetch(`${API_URL}/reset-cache?cacheKey=frontpageOrders`);
            onSuccess?.();
        } catch (err) {
            onError?.(
                err instanceof Error ? err : new Error('Transaction failed or was rejected.')
            );
        } finally {
            setBusy(false);
        }
    }

    const disabled = busy || signing || writing;
    return <button onClick={submit} disabled={disabled} {...props} />;
}
