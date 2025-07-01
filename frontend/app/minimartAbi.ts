const minimartAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'seller',
                type: 'address',
            },
        ],
        name: 'nonces',
        outputs: [
            {
                internalType: 'uint64',
                name: 'nonce',
                type: 'uint64',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'seller',
                        type: 'address',
                    },
                    {
                        internalType: 'uint96',
                        name: 'price',
                        type: 'uint96',
                    },
                    {
                        internalType: 'address',
                        name: 'nftContract',
                        type: 'address',
                    },
                    {
                        internalType: 'uint64',
                        name: 'expiration',
                        type: 'uint64',
                    },
                    {
                        internalType: 'address',
                        name: 'taker',
                        type: 'address',
                    },
                    {
                        internalType: 'uint64',
                        name: 'nonce',
                        type: 'uint64',
                    },
                    {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct MiniMart.Order',
                name: 'order',
                type: 'tuple',
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes',
            },
        ],
        name: 'addOrder',
        outputs: [
            {
                internalType: 'bytes32',
                name: 'orderDigest',
                type: 'bytes32',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32[]',
                name: 'orderHashes',
                type: 'bytes32[]',
            },
        ],
        name: 'batchRemoveOrder',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'orderHash',
                type: 'bytes32',
            },
        ],
        name: 'fulfillOrder',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'orderHash',
                type: 'bytes32',
            },
        ],
        name: 'removeOrder',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

export default minimartAbi;
