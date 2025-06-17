import { useState } from 'react';
import { useAccount, useChainId, useSignTypedData, useWriteContract, useReadContract } from 'wagmi';
import { type Address, zeroAddress } from 'viem';

const miniMartAddr = '' as `0x${string}`;

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
        name: 'addOrder',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'order', type: 'tuple', components: ORDER_COMPONENTS },
            { name: 'signature', type: 'bytes' },
        ],
        outputs: [{ name: 'orderDigest', type: 'bytes32' }],
    },
    {
        name: 'nonces',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '', type: 'address' }],
        outputs: [{ name: '', type: 'uint64' }],
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

export function AddOrderButton({
    price,
    nftContract,
    tokenId,
    expiration = 0n,
    taker = zeroAddress,
    label = 'List Token',
    className,
}: {
    price: bigint | number | string;
    nftContract: Address;
    tokenId: bigint | number | string;
    expiration?: bigint | number | string;
    taker?: Address;
    label?: string;
    className?: string;
}) {
    const { address } = useAccount();
    const chainId = useChainId();

    const { data: nonceData, isLoading: nonceLoading } = useReadContract({
        address: miniMartAddr,
        abi: ABI,
        functionName: 'nonces',
        args: [address ?? zeroAddress],
    });

    const { signTypedDataAsync, isPending: signing } = useSignTypedData();
    const { writeContractAsync, isPending: writing } = useWriteContract();

    const [busy, setBusy] = useState(false);

    async function submit() {
        if (!address) throw new Error('Connect wallet');
        if (nonceData === undefined) throw new Error('Nonce unavailable');
        setBusy(true);

        const msg: Order = {
            seller: address,
            price: BigInt(price),
            nftContract,
            expiration: BigInt(expiration),
            taker,
            nonce: BigInt(nonceData),
            tokenId: BigInt(tokenId),
        };

        const domain = {
            name: 'MiniMart',
            version: '1',
            chainId,
            verifyingContract: miniMartAddr,
        };

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
        } finally {
            setBusy(false);
        }
    }

    const disabled = busy || signing || writing || nonceLoading;

    return (
        <button
            onClick={submit}
            disabled={disabled}
            className={className ?? 'px-4 py-2 rounded-xl font-semibold shadow'}
        >
            {disabled ? 'Submitting…' : label}
        </button>
    );
}
