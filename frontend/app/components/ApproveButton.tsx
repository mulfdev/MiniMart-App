import { useWriteContract } from 'wagmi';
import { type Address } from 'viem';
import { useCallback } from 'react';

const miniMartAddr = '0xd33530ACe9929Bf34197f2E0bED60e7c4170e791' as `0x${string}`;
const erc721Abi = [
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

export function ApproveButton({
    nftContract,
    tokenId,
    className,
    onApprovalSuccess,
}: {
    nftContract: Address;
    tokenId: bigint;
    className?: string;
    onApprovalSuccess: () => void;
}) {
    const { writeContractAsync, isPending, error } = useWriteContract();
    const handleApprove = useCallback(async () => {
        try {
            await writeContractAsync({
                address: nftContract,
                abi: erc721Abi,
                functionName: 'approve',
                args: [miniMartAddr, tokenId],
            });
            onApprovalSuccess();
        } catch (err) {
            console.error('Approval transaction failed:', err);
        }
    }, [nftContract, tokenId, writeContractAsync, onApprovalSuccess]);

    return (
        <div className="w-full">
            <button onClick={handleApprove} disabled={isPending} className={className}>
                {isPending ? 'Approving in Wallet...' : '1. Approve Marketplace'}
            </button>
            {error && (
                <p className="text-red-400 text-sm mt-2 text-center">
                    Approval failed. Please try again.
                </p>
            )}
        </div>
    );
}
