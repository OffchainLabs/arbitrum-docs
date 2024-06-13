---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# decorators/arbOwnerPublicActions

## Type Aliases

### ArbOwnerPublicActions\<TChain\>

> **ArbOwnerPublicActions**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined` = [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Type declaration

##### arbOwnerPrepareTransactionRequest()

> **arbOwnerPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

###### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](../arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestfunctionname)

###### Parameters

• **args**: [`ArbOwnerPrepareTransactionRequestParameters`](../arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

##### arbOwnerReadContract()

> **arbOwnerReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbOwnerReadContractReturnType`](../arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

###### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPublicFunctionName`](../arbOwnerReadContract.md#arbownerpublicfunctionname)

###### Parameters

• **args**: [`ArbOwnerReadContractParameters`](../arbOwnerReadContract.md#arbownerreadcontractparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise` \<[`ArbOwnerReadContractReturnType`](../arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[decorators/arbOwnerPublicActions.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/arbOwnerPublicActions.ts#L15)

## Functions

### arbOwnerPublicActions()

> **arbOwnerPublicActions**\<`TTransport`, `TChain`\>(`client`): [`ArbOwnerPublicActions`](arbOwnerPublicActions.md#arbownerpublicactionstchain)\<`TChain`\>

#### Type parameters

• **TTransport** *extends* `Transport` = `Transport`

• **TChain** *extends* `unknown` = `any`

#### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

#### Returns

[`ArbOwnerPublicActions`](arbOwnerPublicActions.md#arbownerpublicactionstchain)\<`TChain`\>

#### Source

[decorators/arbOwnerPublicActions.ts:27](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/arbOwnerPublicActions.ts#L27)
