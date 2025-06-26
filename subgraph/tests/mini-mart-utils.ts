import { newMockEvent } from 'matchstick-as';
import { ethereum, Bytes, Address, BigInt } from '@graphprotocol/graph-ts';
import {
    EIP712DomainChanged,
    OrderFulfilled,
    OrderListed,
    OrderRemoved,
    OwnershipTransferred,
    Paused,
    Unpaused,
} from '../generated/MiniMart/MiniMart';

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
    let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent());

    eip712DomainChangedEvent.parameters = new Array();

    return eip712DomainChangedEvent;
}

export function createOrderFulfilledEvent(orderId: Bytes, buyer: Address): OrderFulfilled {
    let orderFulfilledEvent = changetype<OrderFulfilled>(newMockEvent());

    orderFulfilledEvent.parameters = new Array();

    orderFulfilledEvent.parameters.push(
        new ethereum.EventParam('orderId', ethereum.Value.fromFixedBytes(orderId)),
    );
    orderFulfilledEvent.parameters.push(
        new ethereum.EventParam('buyer', ethereum.Value.fromAddress(buyer)),
    );

    return orderFulfilledEvent;
}

export function createOrderListedEvent(
    orderId: Bytes,
    seller: Address,
    nftContract: Address,
    tokenId: BigInt,
    price: BigInt,
): OrderListed {
    let orderListedEvent = changetype<OrderListed>(newMockEvent());

    orderListedEvent.parameters = new Array();

    orderListedEvent.parameters.push(
        new ethereum.EventParam('orderId', ethereum.Value.fromFixedBytes(orderId)),
    );
    orderListedEvent.parameters.push(
        new ethereum.EventParam('seller', ethereum.Value.fromAddress(seller)),
    );
    orderListedEvent.parameters.push(
        new ethereum.EventParam('nftContract', ethereum.Value.fromAddress(nftContract)),
    );
    orderListedEvent.parameters.push(
        new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)),
    );
    orderListedEvent.parameters.push(
        new ethereum.EventParam('price', ethereum.Value.fromUnsignedBigInt(price)),
    );

    return orderListedEvent;
}

export function createOrderRemovedEvent(orderId: Bytes): OrderRemoved {
    let orderRemovedEvent = changetype<OrderRemoved>(newMockEvent());

    orderRemovedEvent.parameters = new Array();

    orderRemovedEvent.parameters.push(
        new ethereum.EventParam('orderId', ethereum.Value.fromFixedBytes(orderId)),
    );

    return orderRemovedEvent;
}

export function createOwnershipTransferredEvent(
    previousOwner: Address,
    newOwner: Address,
): OwnershipTransferred {
    let ownershipTransferredEvent = changetype<OwnershipTransferred>(newMockEvent());

    ownershipTransferredEvent.parameters = new Array();

    ownershipTransferredEvent.parameters.push(
        new ethereum.EventParam('previousOwner', ethereum.Value.fromAddress(previousOwner)),
    );
    ownershipTransferredEvent.parameters.push(
        new ethereum.EventParam('newOwner', ethereum.Value.fromAddress(newOwner)),
    );

    return ownershipTransferredEvent;
}

export function createPausedEvent(account: Address): Paused {
    let pausedEvent = changetype<Paused>(newMockEvent());

    pausedEvent.parameters = new Array();

    pausedEvent.parameters.push(
        new ethereum.EventParam('account', ethereum.Value.fromAddress(account)),
    );

    return pausedEvent;
}

export function createUnpausedEvent(account: Address): Unpaused {
    let unpausedEvent = changetype<Unpaused>(newMockEvent());

    unpausedEvent.parameters = new Array();

    unpausedEvent.parameters.push(
        new ethereum.EventParam('account', ethereum.Value.fromAddress(account)),
    );

    return unpausedEvent;
}
