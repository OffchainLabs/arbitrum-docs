---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/gasOverrides

## Type Aliases

### GasOverrideOptions

> **GasOverrideOptions**: `object`

#### Type declaration

##### base?

> `optional` **base**: `bigint`

##### percentIncrease?

> `optional` **percentIncrease**: `bigint`

#### Source

[src/utils/gasOverrides.ts:1](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/gasOverrides.ts#L1)

***

### TransactionRequestGasOverrides

> **TransactionRequestGasOverrides**: `object`

#### Type declaration

##### gasLimit?

> `optional` **gasLimit**: [`GasOverrideOptions`](gasOverrides.md#gasoverrideoptions)

#### Source

[src/utils/gasOverrides.ts:6](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/gasOverrides.ts#L6)

## Functions

### applyPercentIncrease()

> **applyPercentIncrease**(`params`): `bigint`

Calculates the gas limit with a percentage increase based on the provided base and percent increase values.

#### Parameters

• **params**

The parameters for the gas limit calculation.

• **params.base**: `bigint`

The base gas limit.

• **params.percentIncrease?**: `bigint`= `undefined`

The percentage increase to apply to the base gas limit.

#### Returns

`bigint`

- The calculated gas limit with the percentage increase applied.

#### Example

```ts
const gasLimit = applyPercentIncrease({ base: 1000n, percentIncrease: 20n });
console.log(gasLimit); // Outputs: 1200n
```

#### Source

[src/utils/gasOverrides.ts:23](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/gasOverrides.ts#L23)
