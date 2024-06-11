---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridgePrepareTransactionReceipt()

> **createTokenBridgePrepareTransactionReceipt**(`txReceipt`): [`CreateTokenBridgeTransactionReceipt`](../type-aliases/CreateTokenBridgeTransactionReceipt.md)

Creates a transaction receipt with methods to wait for retryables and get
token bridge contracts.

## Parameters

• **txReceipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt

## Returns

[`CreateTokenBridgeTransactionReceipt`](../type-aliases/CreateTokenBridgeTransactionReceipt.md)

- The created transaction receipt

## Source

[src/createTokenBridgePrepareTransactionReceipt.ts:119](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgePrepareTransactionReceipt.ts#L119)
