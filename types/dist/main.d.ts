export interface Contract {
    address: string;
    name: string;
    symbol: string;
    totalSupply: number | null;
    tokenType: string;
    contractDeployer: string;
    deployedBlockNumber: number;
    isSpam: boolean;
    spamClassifications: string[];
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
    tokenType: string;
    name: string | null;
    description: string | null;
    tokenUri: string;
    image: Image;
    orderId?: string;
}
export interface OrderListed {
    id: string;
    orderId: string;
    seller: string;
    nftContract: string;
    tokenId: string;
    price: string;
    blockNumber: number;
    blockTimestamp: number;
    transactionHash: string;
}
export interface GetOrderListedEvents {
    orderListeds: OrderListed[];
}
