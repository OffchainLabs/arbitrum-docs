---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupEnoughCustomFeeTokenAllowance

## Type Aliases

### CreateRollupEnoughCustomFeeTokenAllowanceParams\<TChain\>

> **CreateRollupEnoughCustomFeeTokenAllowanceParams**\<`TChain`\>: [`Prettify`](types/utils.md#prettifyt) \<[`WithRollupCreatorAddressOverride`](types/createRollupTypes.md#withrollupcreatoraddressoverridet)\<`object`\>\>

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createRollupEnoughCustomFeeTokenAllowance.ts:10](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupEnoughCustomFeeTokenAllowance.ts#L10)

## Functions

### createRollupEnoughCustomFeeTokenAllowance()

> **createRollupEnoughCustomFeeTokenAllowance**\<`TChain`\>(`__namedParameters`): `Promise`\<`boolean`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.account**: `Address`

• **\_\_namedParameters.nativeToken**: `Address`

• **\_\_namedParameters.publicClient**: `PublicClient`\<`Transport`, `TChain`\>

• **\_\_namedParameters.rollupCreatorAddressOverride?**: `any`

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`boolean`\>

#### Source

[createRollupEnoughCustomFeeTokenAllowance.ts:19](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupEnoughCustomFeeTokenAllowance.ts#L19)
