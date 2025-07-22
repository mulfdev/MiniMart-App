import 'dotenv/config';
import assert from 'node:assert';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

import { pool } from './db/db.js';
import type { MiniMartEvents } from '@minimart/types';
import { minimartAbi } from './abi/MiniMart.js';
import { enque, eventQueue } from './queue.js';

const { RPC_URL } = process.env;

assert(typeof RPC_URL === 'string', 'RPC_URL must be set');

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
});

const CONTRACT_ADDRESS = '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A';

interface MaxBlockResult {
    rows: { max: string | null }[];
}

async function main() {
    const batchSize = 480n;
    let startBlock = 32908523n;
    let blockHeight = await publicClient.getBlockNumber();

    console.log('indexer running\n');
    try {
        const client = await pool.connect();
        const lastBlockSaved = (await client.query(
            'SELECT MAX(block_number) from events'
        )) as MaxBlockResult;
        const maxValue = lastBlockSaved.rows[0]?.max;

        let blockNumber: bigint | null = null;
        if (maxValue !== null && maxValue !== undefined) {
            blockNumber = BigInt(maxValue);
        }

        console.log(blockNumber);

        if (blockNumber !== null) {
            startBlock = blockNumber;
            console.log('prior indexing found, starting from block: ', startBlock);
        }

        while (true) {
            if (startBlock > blockHeight) {
                console.log('All caught up');
                break;
            }
            let toBlock = startBlock + batchSize - 1n;
            if (toBlock > blockHeight) toBlock = blockHeight;
            if (toBlock < startBlock) {
                startBlock = toBlock + 1n;
                continue;
            }

            const filter = await publicClient.createContractEventFilter({
                abi: minimartAbi,
                address: '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A',
                fromBlock: startBlock,
                toBlock: toBlock,
            });

            const logs = (await publicClient.getFilterLogs({ filter })) as MiniMartEvents[];

            if (logs.length > 0) {
                enque(logs, eventQueue);
            }

            startBlock = toBlock + 1n;
            blockHeight = await publicClient.getBlockNumber();
        }

        console.log('Loop finished. Writing final batch...');

        try {
            console.log('we here now, live sync started \n');

            const eventSigs = minimartAbi.filter((item) => item.type === 'event');
            const unwatch = publicClient.watchEvent({
                address: CONTRACT_ADDRESS,
                events: eventSigs,
                fromBlock: blockHeight,
                onLogs: (logs) => {
                    const formattedLogs = logs as unknown as MiniMartEvents[];
                    enque(formattedLogs, eventQueue);
                },
            });

            process.on('SIGINT', () => {
                unwatch();
                console.log('Shutting down watcher...');
                process.exit(0);
            });
        } catch (e) {
            console.log(e);
        }
    } catch (e) {
        console.error('A critical error occurred in main:', e);
    }
}

void main();
