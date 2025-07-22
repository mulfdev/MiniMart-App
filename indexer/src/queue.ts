import type { MiniMartEvents } from '@minimart/types';
import { writeBatchToDB } from './db/db.js';
import { setTimeout } from 'timers/promises';

let locked = false;
export const eventQueue: MiniMartEvents[] = [];
const deadletterQueue: MiniMartEvents[] = [];

export function enque(newItems: MiniMartEvents[], selectedQueue: MiniMartEvents[]) {
    selectedQueue.push(...newItems);
}

export async function processQueue(queue: MiniMartEvents[]) {
    let retries = 3;
    let success = false;

    if (locked) return;

    if (queue.length === 0) return;

    locked = true;

    const itemsToProcess: MiniMartEvents[] = [];

    if (queue.length > 100) {
        itemsToProcess.push(...queue.splice(0, 100));
    } else {
        itemsToProcess.push(...queue);
        queue.length = 0;
    }

    try {
        while (retries > 0 && !success) {
            try {
                await writeBatchToDB(itemsToProcess);
                success = true;
            } catch (e) {
                retries--;
                console.log(e);
                await setTimeout(125);
            }
        }

        if (!success) {
            deadletterQueue.push(...itemsToProcess);
        }
    } finally {
        locked = false;
    }
}

setInterval(() => {
    void processQueue(eventQueue);
}, 250);

setInterval(() => {
    console.log('checking dead letters');
    if (deadletterQueue.length === 0) {
        console.log('no dead letters found');
        return;
    }

    void processQueue(deadletterQueue);
}, 30_000);
