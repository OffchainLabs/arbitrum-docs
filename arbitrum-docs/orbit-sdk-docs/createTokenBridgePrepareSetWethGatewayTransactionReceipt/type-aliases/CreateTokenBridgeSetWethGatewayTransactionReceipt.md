---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: CreateTokenBridgeSetWethGatewayTransactionReceipt

> **CreateTokenBridgeSetWethGatewayTransactionReceipt**: `TransactionReceipt` & `object`

Extended transaction receipt with added functionality to wait for retryable messages.

## Type declaration

### waitForRetryables()

Waits for retryable messages on the Orbit chain.

#### Parameters

• **params**: [`WaitForRetryablesParameters`](WaitForRetryablesParameters.md)

The parameters required to wait for retryables.

#### Returns

`Promise` \<[`WaitForRetryablesResult`](WaitForRetryablesResult.md)\>

- A promise that resolves to an array of transaction receipts.

## Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:44](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L44)
