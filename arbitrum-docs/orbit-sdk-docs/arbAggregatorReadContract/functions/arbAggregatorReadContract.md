---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: arbAggregatorReadContract()

> **arbAggregatorReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbAggregatorReadContractReturnType`](../type-aliases/ArbAggregatorReadContractReturnType.md)\<`TFunctionName`\>\>

Reads data from the ArbAggregator smart contract and returns the specified
result.

## Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the blockchain chain.

• **TFunctionName** *extends* `"addBatchPoster"` \| `"getBatchPosters"` \| `"getDefaultAggregator"` \| `"getFeeCollector"` \| `"getPreferredAggregator"` \| `"getTxBaseFee"` \| `"setFeeCollector"` \| `"setTxBaseFee"`

The name of the function to read from the contract.

## Parameters

• **client**

The public client to interact with the blockchain.

• **params**: [`ArbAggregatorReadContractParameters`](../type-aliases/ArbAggregatorReadContractParameters.md)\<`TFunctionName`\>

The parameters for reading the contract.

## Returns

`Promise` \<[`ArbAggregatorReadContractReturnType`](../type-aliases/ArbAggregatorReadContractReturnType.md)\<`TFunctionName`\>\>

- The result from the contract function.

## Example

```ts
const client = new PublicClient(...);
const result = await arbAggregatorReadContract(client, {
  functionName: 'getTotalStaked',
  args: [],
});
console.log(result);
```

## Source

[src/arbAggregatorReadContract.ts:35](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/arbAggregatorReadContract.ts#L35)
