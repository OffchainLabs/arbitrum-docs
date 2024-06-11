---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: ArbGasInfoPublicActions\<TChain\>

> **ArbGasInfoPublicActions**\<`TChain`\>: `object`

## Type parameters

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

## Type declaration

### arbGasInfoReadContract()

> **arbGasInfoReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbGasInfoReadContractReturnType`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\>

#### Type parameters

• **TFunctionName** *extends* [`ArbGasInfoFunctionName`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoFunctionName.md)

#### Parameters

• **args**: [`ArbGasInfoReadContractParameters`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractParameters.md)\<`TFunctionName`\>

#### Returns

`Promise` \<[`ArbGasInfoReadContractReturnType`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/decorators/arbGasInfoPublicActions.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/arbGasInfoPublicActions.ts#L10)
