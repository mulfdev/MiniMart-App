export interface Nft {
    collection: string;
    contract: string;
    description: string;
    display_animation_url: string | null;
    display_image_url: string;
    identifier: string;
    image_url: string;
    is_disabled: boolean;
    is_nsfw: boolean;
    metadata_url: string;
    name: string;
    opensea_url: string;
    token_standard: string;
    updated_at: string; // ISO 8601 datetime string
}
