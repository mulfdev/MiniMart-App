import { useState } from 'react';
import { useAccount, useChainId, useSignTypedData, useWriteContract, usePublicClient } from 'wagmi';
import { type Address, zeroAddress } from 'viem';

const miniMartAddr = '0xd33530ACe9929Bf34197f2E0bED60e7c4170e791' as `0x${string}`;
const ORDER_COMPONENTS = [
    { name: 'seller', type: 'address' },
    { name: 'price', type: 'uint96' },
    { name: 'nftContract', type: 'address' },
    { name: 'expiration', type: 'uint64' },
    { name: 'taker', type: 'address' },
    { name: 'nonce', type: 'uint64' },
    { name: 'tokenId', type: 'uint256' },
] as const;
const ABI = [
    {
        type: 'function',
        name: 'nonces',
        stateMutability: 'view',
        inputs: [{ name: 'seller', type: 'address' }],
        outputs: [{ name: 'nonce', type: 'uint64' }],
    },
    {
        type: 'function',
        name: 'addOrder',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'order', type: 'tuple', components: ORDER_COMPONENTS },
            { name: 'signature', type: 'bytes' },
        ],
        outputs: [{ name: 'orderDigest', type: 'bytes32' }],
    },
] as const;

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
                abi: ABI,
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
                abi: ABI,
                functionName: 'addOrder',
                args: [msg, sig],
            });
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
