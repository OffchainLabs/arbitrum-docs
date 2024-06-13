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

[utils/gasOverrides.ts:1](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/gasOverrides.ts#L1)

***

### TransactionRequestGasOverrides

> **TransactionRequestGasOverrides**: `object`

#### Type declaration

##### gasLimit?

> `optional` **gasLimit**: [`GasOverrideOptions`](gasOverrides.md#gasoverrideoptions)

#### Source

[utils/gasOverrides.ts:6](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/gasOverrides.ts#L6)

## Functions

### applyPercentIncrease()

> **applyPercentIncrease**(`__namedParameters`): `bigint`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.base**: `bigint`

• **\_\_namedParameters.percentIncrease?**: `bigint`= `undefined`

#### Returns

`bigint`

#### Source

[utils/gasOverrides.ts:10](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/gasOverrides.ts#L10)
