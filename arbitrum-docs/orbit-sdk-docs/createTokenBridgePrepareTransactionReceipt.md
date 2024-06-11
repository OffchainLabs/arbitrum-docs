---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareTransactionReceipt

## Type Aliases

### CreateTokenBridgeTransactionReceipt

> **CreateTokenBridgeTransactionReceipt**: `TransactionReceipt` & `object`

Represents a transaction receipt with methods to wait for retryables and get token bridge contracts.

#### Type declaration

##### getTokenBridgeContracts()

###### Parameters

• **parentChainPublicClient**: `GetTokenBridgeContractsParameters`

###### Returns

`Promise` \<[`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)\>

##### waitForRetryables()

###### Parameters

• **params**: [`WaitForRetryablesParameters`](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesparameters)

###### Returns

`Promise` \<[`WaitForRetryablesResult`](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult)\>

#### Source

[src/createTokenBridgePrepareTransactionReceipt.ts:105](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareTransactionReceipt.ts#L105)

***

### WaitForRetryablesParameters

> **WaitForRetryablesParameters**: `object`

Parameters for waiting for retryables.

#### Type declaration

##### orbitPublicClient

> **orbitPublicClient**: `PublicClient`

#### Source

[src/createTokenBridgePrepareTransactionReceipt.ts:77](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareTransactionReceipt.ts#L77)

***

### WaitForRetryablesResult

> **WaitForRetryablesResult**: [`TransactionReceipt`, `TransactionReceipt`]

Result of waiting for retryables.

#### Source

[src/createTokenBridgePrepareTransactionReceipt.ts:86](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareTransactionReceipt.ts#L86)

## Functions

### createTokenBridgePrepareTransactionReceipt()

> **createTokenBridgePrepareTransactionReceipt**(`txReceipt`): [`CreateTokenBridgeTransactionReceipt`](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipt)

Creates a transaction receipt with methods to wait for retryables and get
token bridge contracts.

#### Parameters

• **txReceipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt

#### Returns

[`CreateTokenBridgeTransactionReceipt`](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipt)

- The created transaction receipt

#### Source

[src/createTokenBridgePrepareTransactionReceipt.ts:119](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareTransactionReceipt.ts#L119)
