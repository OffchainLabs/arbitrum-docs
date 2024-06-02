---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbAggregatorPrepareTransactionRequest<TFunctionName, TChain>(
  client: object,
  params: ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>,
): Promise<any>;
```

Prepares a transaction request for the ArbAggregator contract function
specified by the given function name. It generates the necessary data and
value for the transaction based on the input parameters and prepares the
transaction request using the provided client and account information.

## Type parameters

| Type parameter |
| :------------- |

| `TFunctionName` _extends_
\| `"addBatchPoster"`
\| `"getBatchPosters"`
\| `"getDefaultAggregator"`
\| `"getFeeCollector"`
\| `"getPreferredAggregator"`
\| `"getTxBaseFee"`
\| `"setFeeCollector"`
\| `"setTxBaseFee"` |
| `TChain` _extends_ `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type                                                                  |
| :-------- | :-------------------------------------------------------------------- |
| `client`  | `object`                                                              |
| `params`  | `ArbAggregatorPrepareTransactionRequestParameters`\<`TFunctionName`\> |

## Returns

`Promise`\<`any`\>

## Source

[src/arbAggregatorPrepareTransactionRequest.ts:77](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/arbAggregatorPrepareTransactionRequest.ts#L77)
