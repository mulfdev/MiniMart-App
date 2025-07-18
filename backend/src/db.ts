import { Pool } from 'pg';

export async function connect() {
    try {
        const pool = new Pool();
        return pool;
    } catch (e) {
        console.log(e);
        throw e;
    }
}
