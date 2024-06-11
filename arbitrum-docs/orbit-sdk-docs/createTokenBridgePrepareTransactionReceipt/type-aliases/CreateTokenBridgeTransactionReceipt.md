---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: CreateTokenBridgeTransactionReceipt

> **CreateTokenBridgeTransactionReceipt**: `TransactionReceipt` & `object`

Represents a transaction receipt with methods to wait for retryables and get token bridge contracts.

## Type declaration

### getTokenBridgeContracts()

#### Parameters

• **parentChainPublicClient**: `GetTokenBridgeContractsParameters`

#### Returns

`Promise` \<[`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)\>

### waitForRetryables()

#### Parameters

• **params**: [`WaitForRetryablesParameters`](WaitForRetryablesParameters.md)

#### Returns

`Promise` \<[`WaitForRetryablesResult`](WaitForRetryablesResult.md)\>

## Source

[src/createTokenBridgePrepareTransactionReceipt.ts:105](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgePrepareTransactionReceipt.ts#L105)
