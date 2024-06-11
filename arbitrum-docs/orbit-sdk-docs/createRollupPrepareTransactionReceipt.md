---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareTransactionReceipt

## Type Aliases

### CreateRollupTransactionReceipt

> **CreateRollupTransactionReceipt**: `TransactionReceipt` & `object`

#### Type declaration

##### getCoreContracts()

###### Returns

[`CoreContracts`](types/CoreContracts.md#corecontracts)

#### Source

[src/createRollupPrepareTransactionReceipt.ts:44](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareTransactionReceipt.ts#L44)

## Functions

### createRollupPrepareTransactionReceipt()

> **createRollupPrepareTransactionReceipt**(`txReceipt`): [`CreateRollupTransactionReceipt`](createRollupPrepareTransactionReceipt.md#createrolluptransactionreceipt)

Creates a transaction receipt for preparing a rollup, including core contract
information. Returns a [CreateRollupTransactionReceipt](createRollupPrepareTransactionReceipt.md#createrolluptransactionreceipt).

#### Parameters

• **txReceipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt from which to create the rollup receipt.

#### Returns

[`CreateRollupTransactionReceipt`](createRollupPrepareTransactionReceipt.md#createrolluptransactionreceipt)

The rollup transaction receipt with core contracts information.

#### Source

[src/createRollupPrepareTransactionReceipt.ts:55](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareTransactionReceipt.ts#L55)
