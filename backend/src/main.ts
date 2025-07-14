import { serve } from '@hono/node-server';
import { HTTPException } from 'hono/http-exception';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
    getListedOrders,
    getUserTokens,
    getOrdersWithMetadata,
    getBatchOrders,
} from './queries/orderListed.js';
import type { Nft, OrderListed } from '@minimart/types';
import assert from 'node:assert';

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
        const orders = await getListedOrders(6);

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

app.get('/user-orders', async (c) => {
    const address = c.req.query('address');
    if (!address) {
        throw new HTTPException(400, { message: 'address is required' });
    }

    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    try {
        const orders = await getUserTokens(address);

        if (!orders || orders.length === 0) {
            return c.json({ nfts: [] }, 200);
        }

        const ordersWithMetadata = await getOrdersWithMetadata(orders);

        if (!ordersWithMetadata) {
            return c.json({ nfts: [] }, 200);
        }

        const tokenData = ordersWithMetadata.map((data) => ({
            ...data.nft,
            orderId: data.orderInfo.id,
        }));

        return c.json({ nfts: tokenData }, 200);
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

    const ordersPromise = getUserTokens(address);

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

    const filteredNfts = nfts
        .filter((nft) => !nft.contract.isSpam)
        .filter((nft) => nft.tokenType === 'ERC721')
        .filter(
            (nft) => nft.tokenUri !== null || nft.tokenUri !== '' || nft.image.originalUrl !== null,
        );

    if (filteredNfts.length === 0) {
        return c.json(filteredNfts, 200);
    }

    const difference = filteredNfts.filter(
        (nftA) =>
            !orders.value.some(
                (nftB) =>
                    nftA.contract.address.toLowerCase() === nftB.nftContract.toLowerCase() &&
                    nftA.tokenId === nftB.tokenId,
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

    const orders = await getBatchOrders([{ contract: nftContract, tokenId: tokenId }]);

    if (!orders) {
        throw new HTTPException(404, { message: 'Could not locate token info' });
    }

    const orderWithMetadata = await getOrdersWithMetadata(orders);

    if (!orderWithMetadata) {
        throw new HTTPException(404, { message: 'Could not locate token info' });
    }

    c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=60');

    return c.json({ orderData: orderWithMetadata[0].orderInfo, nft: orderWithMetadata[0].nft }, 200);
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
