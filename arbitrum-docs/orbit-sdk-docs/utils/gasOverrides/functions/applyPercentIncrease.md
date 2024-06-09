---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function applyPercentIncrease(__namedParameters: object): bigint;
```

applyPercentIncrease calculates the gas limit with a percentage increase
based on the provided base and percent increase values.

## Parameters

| Parameter                            | Type     |
| :----------------------------------- | :------- |
| `__namedParameters`                  | `object` |
| `__namedParameters.base`             | `bigint` |
| `__namedParameters.percentIncrease`? | `bigint` |

## Returns

`bigint`

## Source

[src/utils/gasOverrides.ts:14](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/gasOverrides.ts#L14)
