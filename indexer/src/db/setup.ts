import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import type { PoolClient } from 'pg';

async function setUp() {
    let client: PoolClient | null = null;

    try {
        client = await pool.connect();
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        const fileStr = join(__dirname, 'events.sql');

        console.log({ fileStr });

        const sqlFile = await readFile(join(__dirname, 'events.sql'), { encoding: 'utf8' });

        await client.query(sqlFile);
    } catch (e) {
        console.log('Could not connect to db to do setup');
        console.log(e);
    } finally {
        client?.release();
    }
}
try {
    await setUp();
    console.log('db setup');
    process.exit(0);
} catch (e) {
    console.log(e);
    process.exit(1);
}
