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

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

#### Type declaration

##### arbAggregatorPrepareTransactionRequest()

> **arbAggregatorPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

###### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](../arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestfunctionname)

###### Parameters

• **args**: [`ArbAggregatorPrepareTransactionRequestParameters`](../arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

##### arbAggregatorReadContract()

> **arbAggregatorReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbAggregatorReadContractReturnType`](../arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

###### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorFunctionName`](../arbAggregatorReadContract.md#arbaggregatorfunctionname)

###### Parameters

• **args**: [`ArbAggregatorReadContractParameters`](../arbAggregatorReadContract.md#arbaggregatorreadcontractparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise` \<[`ArbAggregatorReadContractReturnType`](../arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[src/decorators/arbAggregatorActions.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/arbAggregatorActions.ts#L15)

## Functions

### arbAggregatorActions()

> **arbAggregatorActions**\<`TTransport`, `TChain`\>(`client`): [`ArbAggregatorActions`](arbAggregatorActions.md#arbaggregatoractionstchain)\<`TChain`\>

Returns an object with methods to interact with the ArbAggregator smart contract on the specified chain.

#### Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

#### Parameters

• **client**

The public client to use for interacting with the blockchain.

#### Returns

[`ArbAggregatorActions`](arbAggregatorActions.md#arbaggregatoractionstchain)\<`TChain`\>

An object containing methods to read from and prepare transaction requests for the ArbAggregator contract.

#### Source

[src/decorators/arbAggregatorActions.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/arbAggregatorActions.ts#L33)
