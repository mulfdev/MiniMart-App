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

-- Primary optimization: compound index for the CTE's WHERE and PARTITION BY
CREATE INDEX "idx_events_orderid_eventname_block_log" 
ON "events"((args ->> 'orderId'), "event_name", "block_number" DESC, "log_index" DESC)
WHERE "event_name" IN ('OrderListed', 'OrderFulfilled', 'OrderRemoved');

-- Secondary indexes for filter predicates
CREATE INDEX "idx_events_nft_contract" ON "events"(LOWER(args ->> 'nftContract'))
WHERE "event_name" = 'OrderListed';

CREATE INDEX "idx_events_seller" ON "events"(LOWER(args ->> 'seller'))
WHERE "event_name" = 'OrderListed';

CREATE INDEX "idx_events_token_id" ON "events"((args ->> 'tokenId')) 
WHERE "event_name" = 'OrderListed';

-- Create stored function
CREATE OR REPLACE FUNCTION get_active_orders(
    p_limit INTEGER DEFAULT 100,
    p_token_address TEXT DEFAULT NULL,
    p_token_id TEXT DEFAULT NULL,
    p_order_id TEXT DEFAULT NULL,
    p_wallet_address TEXT DEFAULT NULL
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
        AND (p_wallet_address IS NULL OR LOWER(le.args ->> 'seller') = LOWER(p_wallet_address))
    ORDER BY le.block_number DESC
    LIMIT p_limit;
$$;
