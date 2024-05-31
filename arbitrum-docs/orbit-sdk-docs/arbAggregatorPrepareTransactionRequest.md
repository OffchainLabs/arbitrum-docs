[Documentation](README.md) / arbAggregatorPrepareTransactionRequest

## Functions

### arbAggregatorPrepareTransactionRequest()

```ts
function arbAggregatorPrepareTransactionRequest<TFunctionName, TChain>(
  client: object,
  params: ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>,
): Promise<object | object | object>;
```

Prepares a transaction request for the ArbAggregator contract on a specified
chain, based on the provided parameters. It generates the necessary data and
value for the transaction, including handling upgrade scenarios if an upgrade
executor is specified. Returns the prepared transaction request object.

#### Type parameters

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
| `TChain` _extends_ `undefined` \| `Chain` |

#### Parameters

| Parameter | Type                                                                  |
| :-------- | :-------------------------------------------------------------------- |
| `client`  | `object`                                                              |
| `params`  | `ArbAggregatorPrepareTransactionRequestParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/arbAggregatorPrepareTransactionRequest.ts:77](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/arbAggregatorPrepareTransactionRequest.ts#L77)
