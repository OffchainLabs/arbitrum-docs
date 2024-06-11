---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupPrepareTransactionReceipt()

> **createRollupPrepareTransactionReceipt**(`txReceipt`): [`CreateRollupTransactionReceipt`](../type-aliases/CreateRollupTransactionReceipt.md)

Creates a transaction receipt for preparing a rollup, including core contract
information. Returns a [CreateRollupTransactionReceipt](../type-aliases/CreateRollupTransactionReceipt.md).

## Parameters

• **txReceipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt from which to create the rollup receipt.

## Returns

[`CreateRollupTransactionReceipt`](../type-aliases/CreateRollupTransactionReceipt.md)

The rollup transaction receipt with core contracts information.

## Source

[src/createRollupPrepareTransactionReceipt.ts:55](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupPrepareTransactionReceipt.ts#L55)
