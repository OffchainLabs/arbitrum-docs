[Documentation](../../README.md) / [rollupAdminLogicPrepareTransactionRequest](../README.md) / RollupAdminLogicPrepareTransactionRequestParameters

```ts
type RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>: Omit<RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>, "abi"> & object;
```

## Type declaration

| Member    | Type      |
| :-------- | :-------- |
| `account` | `Address` |

## Type parameters

| Type parameter                                                                              |
| :------------------------------------------------------------------------------------------ |
| `TFunctionName` _extends_ [`RollupAdminLogicFunctionName`](RollupAdminLogicFunctionName.md) |

## Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:71](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/rollupAdminLogicPrepareTransactionRequest.ts#L71)
