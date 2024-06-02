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

`CreateRollupTransaction`

## Source

[src/createRollupPrepareTransaction.ts:22](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupPrepareTransaction.ts#L22)
