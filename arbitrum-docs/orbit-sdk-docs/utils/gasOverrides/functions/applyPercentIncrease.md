---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: applyPercentIncrease()

> **applyPercentIncrease**(`params`): `bigint`

Calculates the gas limit with a percentage increase based on the provided base and percent increase values.

## Parameters

• **params**

The parameters for the gas limit calculation.

• **params.base**: `bigint`

The base gas limit.

• **params.percentIncrease?**: `bigint`= `undefined`

The percentage increase to apply to the base gas limit.

## Returns

`bigint`

- The calculated gas limit with the percentage increase applied.

## Example

```ts
const gasLimit = applyPercentIncrease({ base: 1000n, percentIncrease: 20n });
console.log(gasLimit); // Outputs: 1200n
```

## Source

[src/utils/gasOverrides.ts:23](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/gasOverrides.ts#L23)
