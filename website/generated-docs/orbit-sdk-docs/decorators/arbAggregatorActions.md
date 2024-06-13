---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# decorators/arbAggregatorActions

## Type Aliases

### ArbAggregatorActions\<TChain\>

> **ArbAggregatorActions**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined` = [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Type declaration

##### arbAggregatorPrepareTransactionRequest()

> **arbAggregatorPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

###### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](../arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestfunctionname)

###### Parameters

• **args**: [`ArbAggregatorPrepareTransactionRequestParameters`](../arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

##### arbAggregatorReadContract()

> **arbAggregatorReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbAggregatorReadContractReturnType`](../arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

###### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorFunctionName`](../arbAggregatorReadContract.md#arbaggregatorfunctionname)

###### Parameters

• **args**: [`ArbAggregatorReadContractParameters`](../arbAggregatorReadContract.md#arbaggregatorreadcontractparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise` \<[`ArbAggregatorReadContractReturnType`](../arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[decorators/arbAggregatorActions.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/arbAggregatorActions.ts#L15)

## Functions

### arbAggregatorActions()

> **arbAggregatorActions**\<`TTransport`, `TChain`\>(`client`): [`ArbAggregatorActions`](arbAggregatorActions.md#arbaggregatoractionstchain)\<`TChain`\>

#### Type parameters

• **TTransport** *extends* `Transport` = `Transport`

• **TChain** *extends* `unknown` = `any`

#### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

#### Returns

[`ArbAggregatorActions`](arbAggregatorActions.md#arbaggregatoractionstchain)\<`TChain`\>

#### Source

[decorators/arbAggregatorActions.ts:27](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/arbAggregatorActions.ts#L27)
