import { GraphQLClient, gql } from 'graphql-request';
import type { OrderListed, GetOrderListedEvents, Nft } from '@minimart/types';

const GET_ORDERS = gql`
    query GetOrders($filter: OrderListed_filter, $first: Int) {
        orderListeds(where: $filter, first: $first) {
            id
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

// function findUniqueNfts(arrayA: Nft[], arrayB: Nft[]): Nft[] {}

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

export async function getUserTokens(address: string) {
    try {
        const filters = { seller: address };

        const req = await client.request<GetOrderListedEvents>(GET_ORDERS, { filters });

        console.log(req.orderListeds);

        return req.orderListeds;
    } catch (e) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        throw new Error('Could not get user tokens');
    }
}
