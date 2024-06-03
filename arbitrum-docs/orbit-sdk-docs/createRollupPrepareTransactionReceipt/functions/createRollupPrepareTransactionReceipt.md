---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupPrepareTransactionReceipt(txReceipt: TransactionReceipt<bigint, number, "success" | "reverted", TransactionType>): CreateRollupTransactionReceipt
```

Creates a transaction receipt for preparing a rollup, including core contract
information. Returns a CreateRollupTransactionReceipt.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `txReceipt` | `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\> |

## Returns

`CreateRollupTransactionReceipt`

## Source

[src/createRollupPrepareTransactionReceipt.ts:38](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupPrepareTransactionReceipt.ts#L38)
