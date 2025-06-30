import { setTimeout } from 'timers/promises';
import { serve } from '@hono/node-server';
import { HTTPException } from 'hono/http-exception';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getListedOrders } from './queries/orderListed.js';
import type { Nft } from '@minimart/types';
import assert from 'node:assert';
import { db } from './db.js';

const CACHE_KEYS = {
    frontpageOrders: 'frontpageOrders',
} as const;

const { ALCHEMY_API_KEY } = process.env;

assert(typeof ALCHEMY_API_KEY !== 'undefined', 'ALCHEMY_API_KEY required');

const app = new Hono();

const FrontpageOrders = new Map();

app.use(
    cors({
        origin: ['http://localhost:5173', 'https://backend-dawn-tree-7134.fly.dev'],
    }),
);

app.get('/', (c) => {
    return c.text('Hello Hono!');
});

app.get('/get-orders', async (c) => {
    const cachedOrderData = FrontpageOrders.get(CACHE_KEYS.frontpageOrders);
    if (cachedOrderData) {
        return c.json({ nfts: cachedOrderData });
    }
    try {
        const orders = await getListedOrders(6);

        const tokenData: Nft[] = [];
        for (const order of orders) {
            const res = await fetch(
                `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${order.nftContract}&tokenId=${order.tokenId}&tokenType=ERC721&refreshCache=false`,
            );

            if (!res.ok) continue;

            console.log(order.tokenId);

            const data = (await res.json()) as Nft;
            tokenData.push(data);
        }

        FrontpageOrders.set(CACHE_KEYS.frontpageOrders, tokenData);

        return c.json({ nfts: tokenData });
    } catch {
        throw new HTTPException(400, { message: 'Could not get nft data' });
    }
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
