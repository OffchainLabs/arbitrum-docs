---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareTransaction

## Type Aliases

### CreateRollupTransaction

> **CreateRollupTransaction**: `Transaction` & `object`

#### Type declaration

##### getInputs()

Retrieves the inputs for the createRollup function call.

###### Returns

readonly [`object`]

The inputs for the createRollup function.

#### Source

[src/createRollupPrepareTransaction.ts:19](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareTransaction.ts#L19)

## Functions

### createRollupPrepareTransaction()

> **createRollupPrepareTransaction**(`tx`): [`CreateRollupTransaction`](createRollupPrepareTransaction.md#createrolluptransaction)

Creates a transaction object for preparing a createRollup function call,
which extends the base Transaction type and includes a method to retrieve the
inputs for creating a rollup.

#### Parameters

• **tx**: `Transaction`\<`bigint`, `number`, `boolean`\>

The base transaction object.

#### Returns

[`CreateRollupTransaction`](createRollupPrepareTransaction.md#createrolluptransaction)

The prepared transaction object with added getInputs method.

#### Source

[src/createRollupPrepareTransaction.ts:36](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareTransaction.ts#L36)
