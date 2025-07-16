import { GraphQLClient, gql } from 'graphql-request';
import type { OrderListed, GetOrderListedEvents, Nft } from '@minimart/types';
import { ALCHEMY_API_KEY } from '../main.js';
import { HTTPException } from 'hono/http-exception';

const GET_ORDERS = gql`
    query GetOrders($first: Int) {
        orderListeds(first: $first) {
            id
            orderId
            seller
            blockNumber
            tokenId
            nftContract
            price
            blockTimestamp
        }
    }
`;

const GET_USER_ORDERS = gql`
    query GetUserOrders($seller: String!) {
        orderListeds(where: { seller: $seller }) {
            id
            orderId
            seller
            blockNumber
            tokenId
            nftContract
            price
            blockTimestamp
        }
    }
`;

const GET_ORDER = gql`
    query GetSpecificOrders($tokenIds: [String!], $nftContracts: [String!]) {
        orderListeds(where: { tokenId_in: $tokenIds, nftContract_in: $nftContracts }) {
            orderId
            price
            seller
        }
    }
`;

const GET_COLLECTION_ORDERS = gql`
    query GetCollectionOrders($nftContract: String!) {
        orderListeds(where: { nftContract: $nftContract }) {
            id
            orderId
            seller
            blockNumber
            tokenId
            nftContract
            price
            blockTimestamp
        }
    }
`;

const endpoint = 'https://api.studio.thegraph.com/query/29786/minimart/version/latest';

const client = new GraphQLClient(endpoint);

export async function getListedOrders(numItems: number) {
    try {
        const req = await client.request<GetOrderListedEvents>(GET_ORDERS, {
            first: numItems,
        });

        return req.orderListeds;
    } catch (e) {
        console.log(e);
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        throw new Error('Could not fetch orders');
    }
}

export async function getBatchOrders(orders: { contract: string; tokenId: string }[]) {
    try {
        const tokenIds = orders.map((order) => order.tokenId);
        const nftContracts = orders.map((order) => order.contract);

        const orderInfo = await client.request<GetOrderListedEvents>(GET_ORDER, {
            tokenIds,
            nftContracts,
        });

        return orderInfo.orderListeds;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getCollectionOrders(nftContract: string) {
    try {
        const req = await client.request<GetOrderListedEvents>(GET_COLLECTION_ORDERS, {
            nftContract,
        });
        return req.orderListeds;
    } catch (e) {
        console.log(e);
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        throw new Error('Could not fetch collection orders');
    }
}

export async function getOrdersWithMetadata(orders: OrderListed[]) {
    try {
        const tokens = orders.map((order) => ({
            contractAddress: order.nftContract,
            tokenId: order.tokenId,
        }));

        const res = await fetch(
            `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadataBatch`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tokens,
                    tokenType: 'ERC721',
                    refreshCache: false,
                }),
            },
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error fetching NFT metadata: ${res.status} - ${errorText}`);
            return null;
        }

        const data = (await res.json()) as { nfts: Nft[] };

        const nftsMap = data.nfts.reduce(
            (acc, nft) => {
                acc[`${nft.contract.address.toLowerCase()}-${nft.tokenId}`] = nft;
                return acc;
            },
            {} as Record<string, Nft>,
        );

        const ordersWithMetadata = orders
            .map((order) => {
                const nft = nftsMap[`${order.nftContract.toLowerCase()}-${order.tokenId}`];
                if (!nft) return null;
                return { nft: nft, orderInfo: order };
            })
            .filter(Boolean);

        return ordersWithMetadata as { nft: Nft; orderInfo: OrderListed }[];
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getSingleOrder(contract: string, tokenId: string, fetchOrderInfo?: boolean) {
    try {
        const res = await fetch(
            `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&tokenType=ERC721&refreshCache=false`,
        );
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error fetching NFT metadata: ${res.status} - ${errorText}`);
            return null;
        }
        const nft = (await res.json()) as Nft;

        if (!fetchOrderInfo) {
            return {
                listingInfo: null,
                nft,
            };
        }

        const orderInfo = await client.request<GetOrderListedEvents>(GET_ORDER, {
            tokenIds: [tokenId],
            nftContracts: [contract],
        });

        return {
            listingInfo: orderInfo.orderListeds[0],
            nft,
        };
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getUserTokens(address: string) {
    try {
        const req = await client.request<GetOrderListedEvents>(GET_USER_ORDERS, {
            seller: address,
        });

        return req.orderListeds;
    } catch (e) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        throw new Error('Could not get user tokens');
    }
}
