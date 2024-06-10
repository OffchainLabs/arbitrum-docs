---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbAggregatorPrepareTransactionRequest<TFunctionName, TChain>(client: object, params: ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>): Promise<any>
```

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* 
  \| `"addBatchPoster"`
  \| `"getBatchPosters"`
  \| `"getDefaultAggregator"`
  \| `"getFeeCollector"`
  \| `"getPreferredAggregator"`
  \| `"getTxBaseFee"`
  \| `"setFeeCollector"`
  \| `"setTxBaseFee"` |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | [`ArbAggregatorPrepareTransactionRequestParameters`](../type-aliases/ArbAggregatorPrepareTransactionRequestParameters.md)\<`TFunctionName`\> |

## Returns

`Promise`\<`any`\>

## Source

[src/arbAggregatorPrepareTransactionRequest.ts:71](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbAggregatorPrepareTransactionRequest.ts#L71)
