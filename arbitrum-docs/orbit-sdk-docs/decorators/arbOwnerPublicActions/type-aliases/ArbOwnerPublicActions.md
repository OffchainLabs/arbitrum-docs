---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: ArbOwnerPublicActions\<TChain\>

> **ArbOwnerPublicActions**\<`TChain`\>: `object`

## Type parameters

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

## Type declaration

### arbOwnerPrepareTransactionRequest()

> **arbOwnerPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](../../../arbOwnerPrepareTransactionRequest/type-aliases/ArbOwnerPrepareTransactionRequestFunctionName.md)

#### Parameters

• **args**: [`ArbOwnerPrepareTransactionRequestParameters`](../../../arbOwnerPrepareTransactionRequest/type-aliases/ArbOwnerPrepareTransactionRequestParameters.md)\<`TFunctionName`\>

#### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

### arbOwnerReadContract()

> **arbOwnerReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbOwnerReadContractReturnType`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\>

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPublicFunctionName`](../../../arbOwnerReadContract/type-aliases/ArbOwnerPublicFunctionName.md)

#### Parameters

• **args**: [`ArbOwnerReadContractParameters`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractParameters.md)\<`TFunctionName`\>

#### Returns

`Promise` \<[`ArbOwnerReadContractReturnType`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/decorators/arbOwnerPublicActions.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/arbOwnerPublicActions.ts#L15)
