---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupGetCallValue(params: CreateRollupParams): bigint;
```

createRollupGetCallValue calculates the call value needed for creating
retryable tickets in a rollup chain. It returns a BigInt representing
the calculated call value.

## Parameters

| Parameter | Type                 |
| :-------- | :------------------- |
| `params`  | `CreateRollupParams` |

## Returns

`bigint`

## Source

[src/createRollupGetCallValue.ts:10](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupGetCallValue.ts#L10)
