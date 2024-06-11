---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareSetWethGatewayTransactionReceipt

## Type Aliases

### CreateTokenBridgeSetWethGatewayTransactionReceipt

> **CreateTokenBridgeSetWethGatewayTransactionReceipt**: `TransactionReceipt` & `object`

Extended transaction receipt with added functionality to wait for retryable messages.

#### Type declaration

##### waitForRetryables()

Waits for retryable messages on the Orbit chain.

###### Parameters

• **params**: [`WaitForRetryablesParameters`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#waitforretryablesparameters)

The parameters required to wait for retryables.

###### Returns

`Promise` \<[`WaitForRetryablesResult`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#waitforretryablesresult)\>

- A promise that resolves to an array of transaction receipts.

#### Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:44](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L44)

***

### WaitForRetryablesParameters

> **WaitForRetryablesParameters**: `object`

Parameters required to wait for retryable messages.

#### Type declaration

##### orbitPublicClient

> **orbitPublicClient**: `PublicClient`

#### Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:27](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L27)

***

### WaitForRetryablesResult

> **WaitForRetryablesResult**: [`TransactionReceipt`]

Result of waiting for retryable messages.

#### Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:36](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L36)

## Functions

### createTokenBridgePrepareSetWethGatewayTransactionReceipt()

> **createTokenBridgePrepareSetWethGatewayTransactionReceipt**(`txReceipt`): [`CreateTokenBridgeSetWethGatewayTransactionReceipt`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgesetwethgatewaytransactionreceipt)

Creates a token bridge transaction receipt for setting up the WETH gateway,
including a method to wait for retryable messages on the Orbit chain.

#### Parameters

• **txReceipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt to extend.

#### Returns

[`CreateTokenBridgeSetWethGatewayTransactionReceipt`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgesetwethgatewaytransactionreceipt)

- The extended transaction receipt with added functionality.

#### Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:62](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L62)
