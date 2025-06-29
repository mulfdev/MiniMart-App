import assert from 'node:assert';
import { createClient } from '@libsql/client';

const { TURSO_TOKEN, TURSO_DB_URL } = process.env;

assert(typeof TURSO_TOKEN !== 'undefined', 'TURSO_TOKEN must be defined');
assert(typeof TURSO_DB_URL !== 'undefined', 'TURSO_DB_URL must be defined');

export const db = createClient({
    url: TURSO_DB_URL,
    authToken: TURSO_TOKEN,
});
