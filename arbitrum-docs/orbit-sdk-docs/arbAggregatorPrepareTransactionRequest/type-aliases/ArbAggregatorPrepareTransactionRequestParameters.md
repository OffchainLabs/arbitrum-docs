[Documentation](../../README.md) / [arbAggregatorPrepareTransactionRequest](../README.md) / ArbAggregatorPrepareTransactionRequestParameters

```ts
type ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>: Omit<ArbAggregatorPrepareFunctionDataParameters<TFunctionName>, "abi"> & object;
```

## Type declaration

| Member    | Type      |
| :-------- | :-------- |
| `account` | `Address` |

## Type parameters

| Type parameter                                                                                                                          |
| :-------------------------------------------------------------------------------------------------------------------------------------- |
| `TFunctionName` _extends_ [`ArbAggregatorPrepareTransactionRequestFunctionName`](ArbAggregatorPrepareTransactionRequestFunctionName.md) |

## Source

[src/arbAggregatorPrepareTransactionRequest.ts:66](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/arbAggregatorPrepareTransactionRequest.ts#L66)
