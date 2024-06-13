---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# arbAggregatorPrepareTransactionRequest

## Type Aliases

### ArbAggregatorEncodeFunctionDataParameters\<TFunctionName\>

> **ArbAggregatorEncodeFunctionDataParameters**\<`TFunctionName`\>: [`mainnet`](chains.md#mainnet)\<`ArbAggregatorAbi`, `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestfunctionname)

#### Source

[arbAggregatorPrepareTransactionRequest.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorPrepareTransactionRequest.ts#L16)

***

### ArbAggregatorPrepareTransactionRequestFunctionName

> **ArbAggregatorPrepareTransactionRequestFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi)\<`ArbAggregatorAbi`\>

#### Source

[arbAggregatorPrepareTransactionRequest.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorPrepareTransactionRequest.ts#L15)

***

### ArbAggregatorPrepareTransactionRequestParameters\<TFunctionName\>

> **ArbAggregatorPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit`\<`ArbAggregatorPrepareFunctionDataParameters`\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: [`mainnet`](chains.md#mainnet)

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestfunctionname)

#### Source

[arbAggregatorPrepareTransactionRequest.ts:66](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorPrepareTransactionRequest.ts#L66)

## Functions

### arbAggregatorPrepareTransactionRequest()

> **arbAggregatorPrepareTransactionRequest**\<`TFunctionName`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

#### Type parameters

• **TFunctionName** *extends* `"addBatchPoster"` \| `"getBatchPosters"` \| `"getDefaultAggregator"` \| `"getFeeCollector"` \| `"getPreferredAggregator"` \| `"getTxBaseFee"` \| `"setFeeCollector"` \| `"setTxBaseFee"`

• **TChain** *extends* `unknown`

#### Parameters

• **client**: `PublicClient`\<`Transport`, `TChain`\>

• **params**: [`ArbAggregatorPrepareTransactionRequestParameters`](arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

#### Returns

`Promise`\<`any`\>

#### Source

[arbAggregatorPrepareTransactionRequest.ts:71](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorPrepareTransactionRequest.ts#L71)
