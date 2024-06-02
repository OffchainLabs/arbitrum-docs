---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupGetCallValue(params: CreateRollupParams): bigint
```

createRollupGetCallValue calculates the call value needed for creating
retryable tickets in a rollup chain. It returns a BigInt representing
the calculated call value.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `params` | `CreateRollupParams` |

## Returns

`bigint`

## Source

[src/createRollupGetCallValue.ts:10](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupGetCallValue.ts#L10)
