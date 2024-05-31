[Documentation](README.md) / arbAggregatorReadContract

## Functions

### arbAggregatorReadContract()

```ts
function arbAggregatorReadContract<TChain, TFunctionName>(
  client: object,
  params: ArbAggregatorReadContractParameters<TFunctionName>,
): Promise<ArbAggregatorReadContractReturnType<TFunctionName>>;
```

Reads data from the ArbAggregator contract on the specified chain and returns
the result.

#### Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `undefined` \| `Chain` |

| `TFunctionName` _extends_
\| `"addBatchPoster"`
\| `"getBatchPosters"`
\| `"getDefaultAggregator"`
\| `"getFeeCollector"`
\| `"getPreferredAggregator"`
\| `"getTxBaseFee"`
\| `"setFeeCollector"`
\| `"setTxBaseFee"` |

#### Parameters

| Parameter | Type                                                     |
| :-------- | :------------------------------------------------------- |
| `client`  | `object`                                                 |
| `params`  | `ArbAggregatorReadContractParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`ArbAggregatorReadContractReturnType`\<`TFunctionName`\>\>

#### Source

[src/arbAggregatorReadContract.ts:20](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/arbAggregatorReadContract.ts#L20)
