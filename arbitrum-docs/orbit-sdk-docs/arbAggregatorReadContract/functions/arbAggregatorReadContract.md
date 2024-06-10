---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbAggregatorReadContract<TChain, TFunctionName>(client: object, params: ArbAggregatorReadContractParameters<TFunctionName>): Promise<ArbAggregatorReadContractReturnType<TFunctionName>>
```

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

[src/arbAggregatorReadContract.ts:16](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbAggregatorReadContract.ts#L16)
