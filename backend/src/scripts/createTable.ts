import { db } from '../db.js';

db.execute(`
CREATE TABLE nfts (
    token_id TEXT NOT NULL,
    token_type TEXT NOT NULL,
    name TEXT,
    description TEXT,
    token_uri TEXT,
   contract_address TEXT NOT NULL,
   contract_name TEXT NOT NULL,
   contract_symbol TEXT NOT NULL,
   contract_total_supply INTEGER,
   contract_token_type TEXT NOT NULL,
   contract_deployer TEXT NOT NULL,
   contract_deployed_block_number INTEGER NOT NULL,
   contract_is_spam INTEGER NOT NULL, -- Stored as 0 for false, 1 for true
   contract_spam_classifications TEXT, -- Stored as a JSON string array '["value1", "value2"]'
   image_cached_url TEXT,
   image_thumbnail_url TEXT,
   image_png_url TEXT,
   image_content_type TEXT,
   image_size INTEGER,
   image_original_url TEXT,
   PRIMARY KEY (contract_address, token_id)
   );
`);
