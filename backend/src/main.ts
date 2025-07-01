import { serve } from '@hono/node-server';
import { HTTPException } from 'hono/http-exception';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getListedOrders, getUserTokens } from './queries/orderListed.js';
import type { Nft } from '@minimart/types';
import assert from 'node:assert';
import { db } from './db.js';

const CACHE_KEYS = {
    frontpageOrders: 'frontpageOrders',
} as const;

const { ALCHEMY_API_KEY } = process.env;

assert(typeof ALCHEMY_API_KEY !== 'undefined', 'ALCHEMY_API_KEY required');

const app = new Hono();

const FrontpageOrders = new Map<keyof typeof CACHE_KEYS, any[]>();

app.use(
    cors({
        origin: ['http://localhost:5173', 'https://minimart.mulf.wtf'],
    }),
);

app.get('/', (c) => {
    return c.text('Hello Hono!');
});

app.get('/all-orders', async (c) => {
    const cachedOrderData = FrontpageOrders.get(CACHE_KEYS.frontpageOrders);
    if (cachedOrderData) {
        return c.json({ nfts: cachedOrderData });
    }
    try {
        console.log('Fetching listed orders...');
        const orders = await getListedOrders(6);

        console.log('Orders received from subgraph:', JSON.stringify(orders, null, 2));

        if (!orders || orders.length === 0) {
            console.log('No orders found from the subgraph. Returning empty list.');
            return c.json({ nfts: [] });
        }

        const tokenData: Nft[] = [];
        for (const order of orders) {
            console.log(
                `Fetching metadata for contract: ${order.nftContract}, token: ${order.tokenId}`,
            );
            const res = await fetch(
                `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${order.nftContract}&tokenId=${order.tokenId}&tokenType=ERC721&refreshCache=false`,
            );

            console.log(`Alchemy response status for token ${order.tokenId}: ${res.status}`);

            if (!res.ok) {
                console.log(
                    `Failed to fetch metadata for token ${order.tokenId}. Status: ${res.status}`,
                );
                const errorBody = await res.text();
                console.log(`Alchemy error body: ${errorBody}`);
                continue;
            }

            const data = (await res.json()) as Nft;
            tokenData.push(data);
        }

        console.log('Final token data:', JSON.stringify(tokenData, null, 2));

        FrontpageOrders.set(CACHE_KEYS.frontpageOrders, tokenData);

        return c.json({ nfts: tokenData });
    } catch (e) {
        console.error('Error in get-orders handler:', e);
        if (e instanceof Error) {
            throw new HTTPException(400, { message: 'Could not get nft data', cause: e.message });
        }
        throw new HTTPException(400, { message: 'Could not get nft data' });
    }
});

app.get('user-orders', async (c) => {
    const address = c.req.query('address');
    if (!address) {
        return c.json({ error: 'address is required' }, 400);
    }

    const userTokens = await getUserTokens(address);
    return c.json({ nfts: userTokens });
});

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
