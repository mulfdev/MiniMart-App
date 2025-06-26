import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { getListedOrders } from './queries/orderListed.js';

const app = new Hono();

app.get('/', (c) => {
    return c.text('Hello Hono!');
});

app.get('/get-orders', async (c) => {
    const orders = await getListedOrders(3);

    return c.json({ message: 'got orders' }, 200);
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
