---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# types/createRollupTypes

## Type Aliases

### CreateRollupFunctionInputs

> **CreateRollupFunctionInputs**: [`mainnet`](../chains.md#mainnet)\<*typeof* [`abi`](../contracts.md#abi-6), `"createRollup"`\>\[`"args"`\]

#### Source

[types/createRollupTypes.ts:5](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/createRollupTypes.ts#L5)

***

### CreateRollupParams

> **CreateRollupParams**: `Pick` \<[`CreateRollupFunctionInputs`](createRollupTypes.md#createrollupfunctioninputs)\[`0`\], `RequiredKeys`\> & `Partial`\<`Omit` \<[`CreateRollupFunctionInputs`](createRollupTypes.md#createrollupfunctioninputs)\[`0`\], `RequiredKeys`\>\>

#### Source

[types/createRollupTypes.ts:12](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/createRollupTypes.ts#L12)

***

### WithRollupCreatorAddressOverride\<T\>

> **WithRollupCreatorAddressOverride**\<`T`\>: `T` & `object`

#### Type declaration

##### rollupCreatorAddressOverride?

> `optional` **rollupCreatorAddressOverride**: [`mainnet`](../chains.md#mainnet)

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

#### Type parameters

• **T**

#### Source

[types/createRollupTypes.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/createRollupTypes.ts#L15)
