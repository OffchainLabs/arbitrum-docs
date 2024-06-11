---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: CreateTokenBridgeParams

> **CreateTokenBridgeParams**: [`WithTokenBridgeCreatorAddressOverride`](../../types/createTokenBridgeTypes/type-aliases/WithTokenBridgeCreatorAddressOverride.md)\<`object`\>

## Type declaration

### account

> **account**: `PrivateKeyAccount`

### gasOverrides?

> `optional` **gasOverrides**: [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md)

### nativeTokenAddress?

> `optional` **nativeTokenAddress**: `Address`

### orbitChainPublicClient

> **orbitChainPublicClient**: `PublicClient`

### parentChainPublicClient

> **parentChainPublicClient**: `PublicClient`

### retryableGasOverrides?

> `optional` **retryableGasOverrides**: [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md)

### rollupAddress

> **rollupAddress**: `Address`

### rollupOwner

> **rollupOwner**: `Address`

### setWethGatewayGasOverrides?

> `optional` **setWethGatewayGasOverrides**: [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareSetWethGatewayTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md)

## Source

[src/createTokenBridge.ts:40](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridge.ts#L40)
