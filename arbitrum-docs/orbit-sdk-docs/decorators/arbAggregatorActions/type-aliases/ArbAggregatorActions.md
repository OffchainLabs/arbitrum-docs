---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: ArbAggregatorActions\<TChain\>

> **ArbAggregatorActions**\<`TChain`\>: `object`

## Type parameters

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

## Type declaration

### arbAggregatorPrepareTransactionRequest()

> **arbAggregatorPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](../../../arbAggregatorPrepareTransactionRequest/type-aliases/ArbAggregatorPrepareTransactionRequestFunctionName.md)

#### Parameters

• **args**: [`ArbAggregatorPrepareTransactionRequestParameters`](../../../arbAggregatorPrepareTransactionRequest/type-aliases/ArbAggregatorPrepareTransactionRequestParameters.md)\<`TFunctionName`\>

#### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

### arbAggregatorReadContract()

> **arbAggregatorReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbAggregatorReadContractReturnType`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorReadContractReturnType.md)\<`TFunctionName`\>\>

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorFunctionName`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorFunctionName.md)

#### Parameters

• **args**: [`ArbAggregatorReadContractParameters`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorReadContractParameters.md)\<`TFunctionName`\>

#### Returns

`Promise` \<[`ArbAggregatorReadContractReturnType`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/decorators/arbAggregatorActions.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/arbAggregatorActions.ts#L15)
