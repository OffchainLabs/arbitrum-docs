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

[src/arbAggregatorReadContract.ts:6](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorReadContract.ts#L6)

***

### ArbAggregatorFunctionName

> **ArbAggregatorFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`ArbAggregatorAbi`](arbAggregatorReadContract.md#arbaggregatorabi)\>

#### Source

[src/arbAggregatorReadContract.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorReadContract.ts#L7)

***

### ArbAggregatorReadContractParameters\<TFunctionName\>

> **ArbAggregatorReadContractParameters**\<`TFunctionName`\>: `object` & `GetFunctionArgs` \<[`ArbAggregatorAbi`](arbAggregatorReadContract.md#arbaggregatorabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorFunctionName`](arbAggregatorReadContract.md#arbaggregatorfunctionname)

#### Source

[src/arbAggregatorReadContract.ts:9](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorReadContract.ts#L9)

***

### ArbAggregatorReadContractReturnType\<TFunctionName\>

> **ArbAggregatorReadContractReturnType**\<`TFunctionName`\>: `ReadContractReturnType` \<[`ArbAggregatorAbi`](arbAggregatorReadContract.md#arbaggregatorabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorFunctionName`](arbAggregatorReadContract.md#arbaggregatorfunctionname)

#### Source

[src/arbAggregatorReadContract.ts:13](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorReadContract.ts#L13)

## Functions

### arbAggregatorReadContract()

> **arbAggregatorReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbAggregatorReadContractReturnType`](arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

Reads data from the ArbAggregator smart contract and returns the specified
result.

#### Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the blockchain chain.

• **TFunctionName** *extends* `"addBatchPoster"` \| `"getBatchPosters"` \| `"getDefaultAggregator"` \| `"getFeeCollector"` \| `"getPreferredAggregator"` \| `"getTxBaseFee"` \| `"setFeeCollector"` \| `"setTxBaseFee"`

The name of the function to read from the contract.

#### Parameters

• **client**

The public client to interact with the blockchain.

• **params**: [`ArbAggregatorReadContractParameters`](arbAggregatorReadContract.md#arbaggregatorreadcontractparameterstfunctionname)\<`TFunctionName`\>

The parameters for reading the contract.

#### Returns

`Promise` \<[`ArbAggregatorReadContractReturnType`](arbAggregatorReadContract.md#arbaggregatorreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

- The result from the contract function.

#### Example

```ts
const client = new PublicClient(...);
const result = await arbAggregatorReadContract(client, {
  functionName: 'getTotalStaked',
  args: [],
});
console.log(result);
```

#### Source

[src/arbAggregatorReadContract.ts:35](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorReadContract.ts#L35)
