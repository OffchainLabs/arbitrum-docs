---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# arbAggregatorReadContract

## Type Aliases

### ArbAggregatorAbi

> **ArbAggregatorAbi**: *typeof* [`abi`](contracts.md#abi)

#### Source

[arbAggregatorReadContract.ts:6](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorReadContract.ts#L6)

***

### ArbAggregatorFunctionName

> **ArbAggregatorFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`ArbAggregatorAbi`](arbAggregatorReadContract.md#arbaggregatorabi)\>

#### Source

[arbAggregatorReadContract.ts:7](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorReadContract.ts#L7)

***

### ArbAggregatorReadContractParameters\<TFunctionName\>

> **ArbAggregatorReadContractParameters**\<`TFunctionName`\>: `object` & [`mainnet`](chains.md#mainnet) \<[`ArbAggregatorAbi`](arbAggregatorReadContract.md#arbaggregatorabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorFunctionName`](arbAggregatorReadContract.md#arbaggregatorfunctionname)

#### Source

[arbAggregatorReadContract.ts:9](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorReadContract.ts#L9)

***

### ArbAggregatorReadContractReturnType\<TFunctionName\>

> **ArbAggregatorReadContractReturnType**\<`TFunctionName`\>: [`mainnet`](chains.md#mainnet) \<[`ArbAggregatorAbi`](arbAggregatorReadContract.md#arbaggregatorabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorFunctionName`](arbAggregatorReadContract.md#arbaggregatorfunctionname)

#### Source

[arbAggregatorReadContract.ts:13](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorReadContract.ts#L13)

## Functions

### arbAggregatorReadContract()

> **arbAggregatorReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbAggregatorReadContractReturnType`](arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Type parameters

• **TChain** *extends* `unknown`

• **TFunctionName** *extends* `"addBatchPoster"` \| `"getBatchPosters"` \| `"getDefaultAggregator"` \| `"getFeeCollector"` \| `"getPreferredAggregator"` \| `"getTxBaseFee"` \| `"setFeeCollector"` \| `"setTxBaseFee"`

#### Parameters

• **client**: `PublicClient`\<`Transport`, `TChain`\>

• **params**: `any`

#### Returns

`Promise` \<[`ArbAggregatorReadContractReturnType`](arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[arbAggregatorReadContract.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbAggregatorReadContract.ts#L16)
