---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupPrepareTransaction()

> **createRollupPrepareTransaction**(`tx`): [`CreateRollupTransaction`](../type-aliases/CreateRollupTransaction.md)

Creates a transaction object for preparing a createRollup function call,
which extends the base Transaction type and includes a method to retrieve the
inputs for creating a rollup.

## Parameters

• **tx**: `Transaction`\<`bigint`, `number`, `boolean`\>

The base transaction object.

## Returns

[`CreateRollupTransaction`](../type-aliases/CreateRollupTransaction.md)

The prepared transaction object with added getInputs method.

## Source

[src/createRollupPrepareTransaction.ts:36](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupPrepareTransaction.ts#L36)
