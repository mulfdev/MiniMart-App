import {
    EIP712DomainChanged as EIP712DomainChangedEvent,
    OrderFulfilled as OrderFulfilledEvent,
    OrderListed as OrderListedEvent,
    OrderRemoved as OrderRemovedEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
    Paused as PausedEvent,
    Unpaused as UnpausedEvent,
} from '../generated/MiniMart/MiniMart';
import {
    EIP712DomainChanged,
    OrderFulfilled,
    OrderListed,
    OrderRemoved,
    OwnershipTransferred,
    Paused,
    Unpaused,
} from '../generated/schema';
import { store } from '@graphprotocol/graph-ts';

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {
    let entity = new EIP712DomainChanged(event.transaction.hash.concatI32(event.logIndex.toI32()));

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}

export function handleOrderFulfilled(event: OrderFulfilledEvent): void {
    let entity = new OrderFulfilled(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.orderId = event.params.orderId;
    entity.buyer = event.params.buyer;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    store.remove('OrderListed', event.params.orderId.toHexString());

    entity.save();
}

export function handleOrderListed(event: OrderListedEvent): void {
    let entity = new OrderListed(event.params.orderId.toHexString());
    entity.orderId = event.params.orderId;
    entity.seller = event.params.seller;
    entity.nftContract = event.params.nftContract;
    entity.tokenId = event.params.tokenId;
    entity.price = event.params.price;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}

export function handleOrderRemoved(event: OrderRemovedEvent): void {
    let entity = new OrderRemoved(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.orderId = event.params.orderId;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    store.remove('OrderListed', event.params.orderId.toHexString());

    entity.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
    let entity = new OwnershipTransferred(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.previousOwner = event.params.previousOwner;
    entity.newOwner = event.params.newOwner;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}

export function handlePaused(event: PausedEvent): void {
    let entity = new Paused(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
    let entity = new Unpaused(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}
