---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridgePrepareSetWethGatewayTransactionReceipt()

> **createTokenBridgePrepareSetWethGatewayTransactionReceipt**(`txReceipt`): [`CreateTokenBridgeSetWethGatewayTransactionReceipt`](../type-aliases/CreateTokenBridgeSetWethGatewayTransactionReceipt.md)

Creates a token bridge transaction receipt for setting up the WETH gateway,
including a method to wait for retryable messages on the Orbit chain.

## Parameters

• **txReceipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt to extend.

## Returns

[`CreateTokenBridgeSetWethGatewayTransactionReceipt`](../type-aliases/CreateTokenBridgeSetWethGatewayTransactionReceipt.md)

- The extended transaction receipt with added functionality.

## Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:62](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L62)
