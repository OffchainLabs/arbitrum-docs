[Documentation](../../../README.md) / [decorators/arbAggregatorActions](../README.md) / ArbAggregatorActions

```ts
type ArbAggregatorActions<TChain>: object;
```

## Type parameters

| Type parameter                            | Value                  |
| :---------------------------------------- | :--------------------- |
| `TChain` _extends_ `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member                                   | Type                                                                                                                                                                                                                                                                                                                                               |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arbAggregatorPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: [`ArbAggregatorPrepareTransactionRequestParameters`](../../../arbAggregatorPrepareTransactionRequest/type-aliases/ArbAggregatorPrepareTransactionRequestParameters.md)\<`TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>                                                |
| `arbAggregatorReadContract`              | \<`TFunctionName`\>(`args`: [`ArbAggregatorReadContractParameters`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorReadContractParameters.md)\<`TFunctionName`\>) => `Promise`\<[`ArbAggregatorReadContractReturnType`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbAggregatorActions.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/decorators/arbAggregatorActions.ts#L15)
