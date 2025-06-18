export interface Contract {
    address: string;
    name: string;
    symbol: string;
    totalSupply: number | null;
    tokenType: string; // Consider making this a literal type if possible, e.g., "ERC721" | "ERC1155" etc.
    contractDeployer: string;
    deployedBlockNumber: number;
    isSpam: boolean;
    spamClassifications: string[]; // Assuming spamClassifications is an array of strings
}

export interface Image {
    cachedUrl: string | null;
    thumbnailUrl: string | null;
    pngUrl: string | null;
    contentType: string | null;
    size: number | null;
    originalUrl: string | null;
}

export interface Nft {
    contract: Contract;
    tokenId: string;
    tokenType: string; // Consider making this a literal type if possible, e.g., "ERC721" | "ERC1155" etc.
    name: string | null;
    description: string | null;
    tokenUri: string;
    image: Image;
}
