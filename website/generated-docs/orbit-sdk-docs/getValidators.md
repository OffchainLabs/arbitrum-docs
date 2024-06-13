---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# getValidators

## Type Aliases

### GetValidatorsParams

> **GetValidatorsParams**: `object`

#### Type declaration

##### rollup

> **rollup**: [`mainnet`](chains.md#mainnet)

Address of the rollup we're getting list of validators from

#### Source

[getValidators.ts:60](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/getValidators.ts#L60)

***

### GetValidatorsReturnType

> **GetValidatorsReturnType**: `object`

#### Type declaration

##### isAccurate

> **isAccurate**: `boolean`

If logs contain unknown signature, validators list might:
- contain false positives (validators that were removed, but returned as validator)
- contain false negatives (validators that were added, but not present in the list)

##### validators

> **validators**: [`mainnet`](chains.md#mainnet)[]

List of validators for the given rollup

#### Source

[getValidators.ts:64](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/getValidators.ts#L64)

## Functions

### getValidators()

> **getValidators**\<`TChain`\>(`publicClient`, `GetValidatorsParams`): `Promise` \<[`GetValidatorsReturnType`](getValidators.md#getvalidatorsreturntype)\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **publicClient**: `PublicClient`\<`Transport`, `TChain`\>

The chain Viem Public Client

• **GetValidatorsParams**: [`GetValidatorsParams`](getValidators.md#getvalidatorsparams)

[GetValidatorsParams](getValidators.md#getvalidatorsparams)

#### Returns

`Promise` \<[`GetValidatorsReturnType`](getValidators.md#getvalidatorsreturntype)\>

Promise<[GetValidatorsReturnType](getValidators.md#getvalidatorsreturntype)>

#### Remarks

validators list is not guaranteed to be exhaustive if the `isAccurate` flag is false.
It might contain false positive (validators that were removed, but returned as validator)
or false negative (validators that were added, but not present in the list)

#### Example

```ts
const { isAccurate, validators } = getValidators(client, { rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336' });

if (isAccurate) {
  // Validators were all fetched properly
} else {
  // Validators list is not guaranteed to be accurate
}
```

#### Source

[getValidators.ts:95](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/getValidators.ts#L95)
