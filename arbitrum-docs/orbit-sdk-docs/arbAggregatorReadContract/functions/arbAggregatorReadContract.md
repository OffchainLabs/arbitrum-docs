---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbAggregatorReadContract<TChain, TFunctionName>(client: object, params: ArbAggregatorReadContractParameters<TFunctionName>): Promise<ArbAggregatorReadContractReturnType<TFunctionName>>
```

Reads data from the ArbAggregator smart contract and returns the specified
result.

## Type parameters

| Type parameter |
| :------ |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |
| `TFunctionName` *extends* 
  \| `"addBatchPoster"`
  \| `"getBatchPosters"`
  \| `"getDefaultAggregator"`
  \| `"getFeeCollector"`
  \| `"getPreferredAggregator"`
  \| `"getTxBaseFee"`
  \| `"setFeeCollector"`
  \| `"setTxBaseFee"` |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | [`ArbAggregatorReadContractParameters`](../type-aliases/ArbAggregatorReadContractParameters.md)\<`TFunctionName`\> |

## Returns

`Promise` \<[`ArbAggregatorReadContractReturnType`](../type-aliases/ArbAggregatorReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/arbAggregatorReadContract.ts:20](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbAggregatorReadContract.ts#L20)
