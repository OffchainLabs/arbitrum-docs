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

[src/createRollupPrepareTransactionReceipt.ts:38](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupPrepareTransactionReceipt.ts#L38)
