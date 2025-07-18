import { serve } from '@hono/node-server';
import { HTTPException } from 'hono/http-exception';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
    getListedOrders,
    getUserTokens,
    getOrdersWithMetadata,
    getSingleOrder,
    getCollectionOrders,
} from './queries/orderListed.js';
import type { Nft, OrderListed } from '@minimart/types';
import assert from 'node:assert';
import { connect } from './db.js';
import type { QueryResult } from 'pg';
//////////// Startup checks

export const { ALCHEMY_API_KEY } = process.env;

assert(typeof ALCHEMY_API_KEY !== 'undefined', 'ALCHEMY_API_KEY required');

//////////// App and routes
const app = new Hono();

app.use(
    cors({
        origin: ['http://localhost:5173', 'https://minimart.mulf.wtf'],
    }),
);

app.get('/', (c) => {
    return c.json({ status: 'running' });
});

app.get('/all-orders', async (c) => {
    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    try {
        const orders = await getListedOrders(20);

        if (!orders || orders.length === 0) {
            console.log('No orders found from the subgraph. Returning empty list.');
            return c.json({ nfts: [] });
        }

        const tokenData = await getOrdersWithMetadata(orders);

        return c.json({ nfts: tokenData }, 200);
    } catch (e) {
        console.error('Error in get-orders handler:', e);
        if (e instanceof Error) {
            throw new HTTPException(400, { message: 'Could not get nft data', cause: e.message });
        }
        throw new HTTPException(400, { message: 'Could not get nft data' });
    }
});

app.get('/collections', async (c) => {
    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    try {
        const orders = await getListedOrders(100);
        if (!orders || orders.length === 0) {
            return c.json({ collections: [] });
        }

        const uniqueContractAddresses = Array.from(
            new Set(orders.map((order) => order.args.nftContract)),
        );

        const collectionPromises = uniqueContractAddresses.map(async (contractAddress) => {
            const res = await fetch(
                `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getContractMetadata?contractAddress=${contractAddress}`,
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.error(
                    `Error fetching collection metadata for ${contractAddress}: ${res.status} - ${errorText}`,
                );
                try {
                    const errorData = JSON.parse(errorText);
                    console.error('Alchemy API Error Details:', errorData);
                } catch (parseError) {
                    // If it's not JSON, just log the raw text
                    console.error('Raw error response:', errorText);
                }
                return null;
            }
            const data = await res.json();
            const contractMetadata = data.openSeaMetadata;

            if (!contractMetadata) {
                console.warn(
                    `No contract metadata found for ${contractAddress}. Using placeholders.`,
                );
                return {
                    contractAddress,
                    name: 'Unknown Collection',
                    image: '/placeholder-collection.svg',
                    description: '',
                };
            }

            return {
                contractAddress,
                name: contractMetadata.collectionName || 'This Collection',
                image:
                    contractMetadata.imageUrl ||
                    contractMetadata.bannerImageUrl ||
                    '/placeholder-collection.svg',
                description: contractMetadata?.description || '',
            };
        });

        const collections = (await Promise.all(collectionPromises)).filter(Boolean);

        return c.json({ collections }, 200);
    } catch (e) {
        console.error('Error in get-collections handler:', e);
        if (e instanceof Error) {
            throw new HTTPException(400, {
                message: 'Could not get collection data',
                cause: e.message,
            });
        }
        throw new HTTPException(400, { message: 'Could not get collection data' });
    }
});

app.get('/collections/:contractAddress', async (c) => {
    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    try {
        const contractAddress = c.req.param('contractAddress');

        if (!contractAddress) {
            throw new HTTPException(400, { message: 'contractAddress is required' });
        }

        const orders = await getCollectionOrders(contractAddress);

        if (!orders || orders.length === 0) {
            return c.json({ nfts: [] });
        }

        const tokenData = await getOrdersWithMetadata(orders);

        const res = await fetch(
            `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getContractMetadata?contractAddress=${contractAddress}`,
        );

        let collectionName = 'This Collection';
        if (res.ok) {
            const data = await res.json();
            if (data.contractMetadata && data.contractMetadata.name) {
                collectionName = data.contractMetadata.name;
            }
        }

        return c.json({ nfts: tokenData, collectionName }, 200);
    } catch (e) {
        console.error('Error in get-collection-listings handler:', e);
        if (e instanceof Error) {
            throw new HTTPException(400, {
                message: 'Could not get collection listings',
                cause: e.message,
            });
        }
        throw new HTTPException(400, { message: 'Could not get collection listings' });
    }
});

app.get('/user-orders', async (c) => {
    const address = c.req.query('address');
    if (!address) {
        throw new HTTPException(400, { message: 'address is required' });
    }

    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    try {
        const orders = await getUserTokens(address);

        if (!orders || orders.length === 0) {
            return c.json([], 200);
        }

        const tokenData = await getOrdersWithMetadata(orders);

        return c.json(tokenData, 200);
    } catch (e) {
        console.error('Error in user-orders handler:', e);
        if (e instanceof Error) {
            throw new HTTPException(400, {
                message: 'Could not get user order data',
                cause: e.message,
            });
        }
        throw new HTTPException(400, { message: 'Could not get user order data' });
    }
});

app.get('/user-inventory', async (c) => {
    const address = c.req.query('address');

    if (!address) throw new HTTPException(400, { message: 'Address is required' });
    if (address.length !== 42 && !address.startsWith('0x')) {
        throw new HTTPException(400, { message: 'Incorrect address' });
    }

    const res = fetch(
        `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=100`,
    );

    const db = await connect();

    const ordersPromise: Promise<QueryResult<OrderListed>> = db.query(
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

    //const ordersPromise = getUserTokens(address);

    const [fetchedNfts, orders] = await Promise.allSettled([res, ordersPromise]);

    if (fetchedNfts.status === 'rejected') {
        console.log(fetchedNfts.reason);
        throw new HTTPException(500, { message: 'there was a problem getting your nfts' });
    }

    if (orders.status === 'rejected') {
        console.log(orders.reason);
        throw new HTTPException(500, { message: 'there was a problem fetchng your orders' });
    }

    const data = await fetchedNfts.value.json();

    const nfts = data.ownedNfts as Nft[];

    console.log(orders.value.rows);

    const filteredNfts = nfts
        .filter((nft) => !nft.contract.isSpam)
        .filter((nft) => nft.tokenType === 'ERC721')
        .filter(
            (nft) => nft.tokenUri !== null || nft.tokenUri !== '' || nft.image.originalUrl !== null,
        )
        .filter((nft) => !nft.name?.includes('drop'))
        .filter((nft) => !nft.name?.includes('win'))
        .filter((nft) => !nft.name?.includes('usdc'))
        .filter((nft) => !nft.name?.includes('claim'))
        .filter((nft) => !nft.description?.includes('drop'))
        .filter((nft) => !nft.description?.includes('win'))
        .filter((nft) => !nft.description?.includes('claim'));

    if (filteredNfts.length === 0) {
        return c.json(filteredNfts, 200);
    }

    const difference = filteredNfts.filter(
        (nftA) =>
            !orders.value.rows.some(
                (nftB) =>
                    nftA.contract.address.toLowerCase() === nftB.args.nftContract.toLowerCase() &&
                    nftA.tokenId === nftB.args.tokenId.toString(),
            ),
    );
    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    return c.json({ nfts: difference }, 200);
});

app.get('/single-token', async (c) => {
    const nftContract = c.req.query('nftContract');
    const tokenId = c.req.query('tokenId');
    const getOrderInfo = c.req.query('orderInfo');

    if (!nftContract || !tokenId) {
        throw new HTTPException(400, { message: 'nftContract and tokenId required' });
    }

    const orderInfo = await getSingleOrder(nftContract, tokenId, Boolean(getOrderInfo));

    if (!orderInfo) {
        throw new HTTPException(404, { message: 'Could not locate token info' });
    }

    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    return c.json({ orderData: orderInfo.listingInfo, nft: orderInfo.nft }, 200);
});

app.get('/reset-cache', (c) => {
    return c.json({ message: `cahce key cleared` });
});

////////////// Start Server and handle shutdowns

const server = serve(
    {
        fetch: app.fetch,
        hostname: '0.0.0.0',
        port: 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);

process.on('SIGINT', () => {
    server.close();
    process.exit(0);
});
process.on('SIGTERM', () => {
    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        process.exit(0);
    });
});
