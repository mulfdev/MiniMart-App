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
    query GetSpecificOrders($tokenId: String!, $nftContract: String!) {
        orderListeds(where: { tokenId: $tokenId, nftContract: $nftContract }) {
            orderId
            price
            seller
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

export async function getSingleOrder(contract: string, tokenId: string, fetchOrderInfo?: boolean) {
    try {
        const res = await fetch(
            `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&tokenType=ERC721&refreshCache=false`,
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
            tokenId,
            nftContract: contract,
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
