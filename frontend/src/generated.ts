import {
    createUseReadContract,
    createUseWriteContract,
    createUseSimulateContract,
} from 'wagmi/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// minimart
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const minimartAbi = [
    {
        type: 'function',
        inputs: [{ name: 'seller', internalType: 'address', type: 'address' }],
        name: 'nonces',
        outputs: [{ name: 'nonce', internalType: 'uint64', type: 'uint64' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            {
                name: 'order',
                internalType: 'struct MiniMart.Order',
                type: 'tuple',
                components: [
                    { name: 'seller', internalType: 'address', type: 'address' },
                    { name: 'price', internalType: 'uint96', type: 'uint96' },
                    { name: 'nftContract', internalType: 'address', type: 'address' },
                    { name: 'expiration', internalType: 'uint64', type: 'uint64' },
                    { name: 'taker', internalType: 'address', type: 'address' },
                    { name: 'nonce', internalType: 'uint64', type: 'uint64' },
                    { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
                ],
            },
            { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'addOrder',
        outputs: [{ name: 'orderDigest', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'orderHashes', internalType: 'bytes32[]', type: 'bytes32[]' }],
        name: 'batchRemoveOrder',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
        name: 'fulfillOrder',
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
        name: 'removeOrder',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link minimartAbi}__
 */
export const useReadMinimart = /*#__PURE__*/ createUseReadContract({
    abi: minimartAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadMinimartNonces = /*#__PURE__*/ createUseReadContract({
    abi: minimartAbi,
    functionName: 'nonces',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link minimartAbi}__
 */
export const useWriteMinimart = /*#__PURE__*/ createUseWriteContract({
    abi: minimartAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"addOrder"`
 */
export const useWriteMinimartAddOrder = /*#__PURE__*/ createUseWriteContract({
    abi: minimartAbi,
    functionName: 'addOrder',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"batchRemoveOrder"`
 */
export const useWriteMinimartBatchRemoveOrder = /*#__PURE__*/ createUseWriteContract({
    abi: minimartAbi,
    functionName: 'batchRemoveOrder',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"fulfillOrder"`
 */
export const useWriteMinimartFulfillOrder = /*#__PURE__*/ createUseWriteContract({
    abi: minimartAbi,
    functionName: 'fulfillOrder',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"removeOrder"`
 */
export const useWriteMinimartRemoveOrder = /*#__PURE__*/ createUseWriteContract({
    abi: minimartAbi,
    functionName: 'removeOrder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link minimartAbi}__
 */
export const useSimulateMinimart = /*#__PURE__*/ createUseSimulateContract({
    abi: minimartAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"addOrder"`
 */
export const useSimulateMinimartAddOrder = /*#__PURE__*/ createUseSimulateContract({
    abi: minimartAbi,
    functionName: 'addOrder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"batchRemoveOrder"`
 */
export const useSimulateMinimartBatchRemoveOrder = /*#__PURE__*/ createUseSimulateContract({
    abi: minimartAbi,
    functionName: 'batchRemoveOrder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"fulfillOrder"`
 */
export const useSimulateMinimartFulfillOrder = /*#__PURE__*/ createUseSimulateContract({
    abi: minimartAbi,
    functionName: 'fulfillOrder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link minimartAbi}__ and `functionName` set to `"removeOrder"`
 */
export const useSimulateMinimartRemoveOrder = /*#__PURE__*/ createUseSimulateContract({
    abi: minimartAbi,
    functionName: 'removeOrder',
});
