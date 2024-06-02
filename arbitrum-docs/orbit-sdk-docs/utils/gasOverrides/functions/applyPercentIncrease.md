---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function applyPercentIncrease(__namedParameters: object): bigint
```

applyPercentIncrease calculates the gas limit with a percentage increase
based on the provided base and percent increase values.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.base` | `bigint` |
| `__namedParameters.percentIncrease`? | `bigint` |

## Returns

`bigint`

## Source

[src/utils/gasOverrides.ts:14](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/utils/gasOverrides.ts#L14)
