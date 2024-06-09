---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupPrepareTransaction(
  tx: Transaction<bigint, number, boolean>,
): CreateRollupTransaction;
```

Creates a transaction object for preparing a createRollup function call,
which extends the base Transaction type and includes a method to retrieve the
inputs for creating a rollup.

## Parameters

| Parameter | Type                                           |
| :-------- | :--------------------------------------------- |
| `tx`      | `Transaction`\<`bigint`, `number`, `boolean`\> |

## Returns

[`CreateRollupTransaction`](../type-aliases/CreateRollupTransaction.md)

## Source

[src/createRollupPrepareTransaction.ts:22](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupPrepareTransaction.ts#L22)
