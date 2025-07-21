-- Drop existing indexes and table
DROP INDEX IF EXISTS "idx_events_block_number";
DROP INDEX IF EXISTS "idx_events_args";
DROP INDEX IF EXISTS "idx_events_event_name";
DROP TABLE IF EXISTS "events";

-- Create table with the correct primary key
CREATE TABLE "events" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "log_index" INTEGER NOT NULL,
    PRIMARY KEY ("transaction_hash", "log_index")
);

-- Create optimized indexes
CREATE INDEX "idx_events_block_number" ON "events"("block_number");
CREATE INDEX "idx_events_args" ON "events" USING GIN ("args");
CREATE INDEX "idx_events_name_block_desc" ON "events"("event_name", "block_number" DESC);
CREATE INDEX "idx_events_order_id" ON "events"((args ->> 'orderId'));
CREATE INDEX "idx_events_token_address" ON "events"((args ->> 'tokenAddress')) 
WHERE args ? 'tokenAddress';
CREATE INDEX "idx_events_token_id" ON "events"((args ->> 'tokenId')) 
WHERE args ? 'tokenId';

-- Create stored function
CREATE OR REPLACE FUNCTION get_active_orders(
    p_limit INTEGER DEFAULT 100,
    p_token_address TEXT DEFAULT NULL,
    p_token_id TEXT DEFAULT NULL,
    p_order_id TEXT DEFAULT NULL
) 
RETURNS TABLE (
    event_name TEXT,
    args JSONB,
    block_number BIGINT,
    transaction_hash TEXT
) 
LANGUAGE SQL
AS $$
    WITH latest_events AS (
        SELECT
            e.event_name,
            e.args,
            e.block_number,
            e.transaction_hash,
            ROW_NUMBER() OVER (
                PARTITION BY (e.args ->> 'orderId')
                ORDER BY
                    e.block_number DESC, e.log_index DESC
            ) AS rn
        FROM
            events e
        WHERE
            e.event_name IN ('OrderListed', 'OrderFulfilled', 'OrderRemoved')
    )
    SELECT
        le.event_name,
        le.args,
        le.block_number,
        le.transaction_hash
    FROM
        latest_events le
    WHERE
        le.rn = 1
        AND le.event_name = 'OrderListed'
        AND (p_token_address IS NULL OR LOWER(le.args ->> 'nftContract') = LOWER(p_token_address))
        AND (p_token_id IS NULL OR le.args ->> 'tokenId' = p_token_id)
        AND (p_order_id IS NULL OR le.args ->> 'orderId' = p_order_id)
    ORDER BY le.block_number DESC
    LIMIT p_limit;
$$;