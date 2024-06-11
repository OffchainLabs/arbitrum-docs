---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# types/createRollupTypes

## Type Aliases

### CreateRollupFunctionInputs

> **CreateRollupFunctionInputs**: `GetFunctionArgs`\<*typeof* [`abi`](../contracts.md#abi-6), `"createRollup"`\>\[`"args"`\]

#### Source

[src/types/createRollupTypes.ts:5](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/createRollupTypes.ts#L5)

***

### CreateRollupParams

> **CreateRollupParams**: `Pick` \<[`CreateRollupFunctionInputs`](createRollupTypes.md#createrollupfunctioninputs)\[`0`\], `RequiredKeys`\> & `Partial`\<`Omit` \<[`CreateRollupFunctionInputs`](createRollupTypes.md#createrollupfunctioninputs)\[`0`\], `RequiredKeys`\>\>

#### Source

[src/types/createRollupTypes.ts:12](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/createRollupTypes.ts#L12)

***

### WithRollupCreatorAddressOverride\<T\>

> **WithRollupCreatorAddressOverride**\<`T`\>: `T` & `object`

#### Type declaration

##### rollupCreatorAddressOverride?

> `optional` **rollupCreatorAddressOverride**: `Address`

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

#### Type parameters

• **T**

#### Source

[src/types/createRollupTypes.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/createRollupTypes.ts#L15)
