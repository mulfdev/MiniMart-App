import type { OrderListed, GetOrderListedEvents, Nft } from '@minimart/types';
import { ALCHEMY_API_KEY } from '../main.js';
import type { Pool, QueryResult } from 'pg';
import { connect } from '../db.js';

export async function getListedOrders(numItems: number) {
    let db: Pool | null = null;
    try {
        db = await connect();
        const orders: QueryResult<OrderListed> = await db.query(
            `SELECT * FROM get_active_orders(${numItems});`,
        );
        if (orders.rows.length === 0) {
            return [];
        }

        return orders.rows;
    } catch (e) {
        console.log(e);
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        throw new Error('Could not fetch orders');
    } finally {
        await db?.end();
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
            contractAddress: order.args.nftContract,
            tokenId: order.args.tokenId,
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
                const nft =
                    nftsMap[`${order.args.nftContract.toLowerCase()}-${order.args.tokenId}`];
                if (!nft) return null;
                return { nft: nft, orderInfo: order.args };
            })
            .filter(Boolean);

        return ordersWithMetadata as { nft: Nft; orderInfo: OrderListed['args'] }[];
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getSingleOrder(contract: string, tokenId: string, fetchOrderInfo?: boolean) {
    let db: Pool | null = null;
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
        console.log(nft);
        db = await connect();

        const orderInfo = await db.query(`SELECT * FROM get_active_orders(1, $1, $2)`, [
            nft.contract.address,
            nft.tokenId,
        ]);

        if (orderInfo.rows.length !== 1) {
            throw new Error('there was a problem with your request');
        }

        return {
            listingInfo: orderInfo.rows[0],
            nft,
        };
    } catch (e) {
        console.log(e);
        return null;
    } finally {
        db?.end();
    }
}

export async function getUserTokens(address: string) {
    try {
        const db = await connect();

        const orders: QueryResult<OrderListed> = await db.query(
            `
WITH latest_events AS (
    SELECT
        event_name,
        args,
        block_number,
        transaction_hash,
        ROW_NUMBER() OVER (
            PARTITION BY (args ->> 'orderId')
            ORDER BY
                CAST(block_number AS BIGINT) DESC
        ) AS rn
    FROM
        events
    WHERE
        event_name IN ('OrderListed', 'OrderFulfilled', 'OrderRemoved')
)
SELECT
    event_name,
    args,
    block_number,
    transaction_hash
FROM
    latest_events
WHERE
    rn = 1
    AND event_name = 'OrderListed'
    AND args->>'seller' = $1
`,
            [address],
        );

        if (orders.rows.length === 0) {
            return [];
        }
        return orders.rows;
    } catch (e) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        throw new Error('Could not get user tokens');
    }
}
