import 'dotenv/config';
import { Pool, type PoolClient } from 'pg';
import type { MiniMartEvents } from '../../types/events.js';
import format from 'pg-format';

export const pool = new Pool();

function replacer(_key: string, value: unknown): unknown {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

export async function writeBatchToDB(eventBatch: MiniMartEvents[]) {
    let client: PoolClient | null = null;
    try {
        client = await pool.connect();

        const formattedEvents = eventBatch.map((event) => [
            event.eventName,
            JSON.stringify(event.args, replacer),
            event.blockNumber.toString(),
            event.transactionHash,
            event.logIndex,
        ]);

        const queryText = format(
            'INSERT INTO events (event_name, args, block_number, transaction_hash, log_index) VALUES %L ON CONFLICT (transaction_hash, log_index) DO NOTHING',
            formattedEvents
        );

        await client.query('BEGIN');
        await client.query(queryText);
        await client.query('COMMIT');

        console.log(`Successfully wrote ${eventBatch.length} unique events to the database.`);

        eventBatch.length = 0;
    } catch (e) {
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Error writing to the database, rolling back transaction.', e);
            } catch (e) {
                console.log('rollback failed: ', e);
            }
        }
        throw e;
    } finally {
        if (client) {
            client.release();
        }
    }
}
