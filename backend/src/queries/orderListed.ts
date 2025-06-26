import { GraphQLClient, gql } from 'graphql-request';
import { type OrderListed, type GetOrderListedEvents } from '@minimart/types';

const GET_ORDER_LISTED_EVENTS = gql`
    query GetOrderListedEvents($first: Int) {
        orderListeds(first: $first) {
            id
            orderId
            seller
            nftContract
            tokenId
            price
            blockNumber
            blockTimestamp
            transactionHash
        }
    }
`;

const endpoint = 'https://api.studio.thegraph.com/query/29786/minimart/version/latest';

const client = new GraphQLClient(endpoint);

export async function getListedOrders(numItems: number): Promise<OrderListed[]> {
    try {
        const req = await client.request<GetOrderListedEvents>(GET_ORDER_LISTED_EVENTS, {
            first: numItems,
        });

        console.log(req.orderListeds);

        return req.orderListeds;
    } catch (e) {
        console.log(e);
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        throw new Error('Could not fetch orders');
    }
}
