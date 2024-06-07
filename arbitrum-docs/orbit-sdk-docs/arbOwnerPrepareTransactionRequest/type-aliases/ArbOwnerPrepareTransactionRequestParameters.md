[Documentation](../../README.md) / [arbOwnerPrepareTransactionRequest](../README.md) / ArbOwnerPrepareTransactionRequestParameters

```ts
type ArbOwnerPrepareTransactionRequestParameters<TFunctionName>: Omit<ArbOwnerPrepareFunctionDataParameters<TFunctionName>, "abi"> & object;
```

## Type declaration

| Member    | Type      |
| :-------- | :-------- |
| `account` | `Address` |

## Type parameters

| Type parameter                                                                                                                |
| :---------------------------------------------------------------------------------------------------------------------------- |
| `TFunctionName` _extends_ [`ArbOwnerPrepareTransactionRequestFunctionName`](ArbOwnerPrepareTransactionRequestFunctionName.md) |

## Source

[src/arbOwnerPrepareTransactionRequest.ts:64](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/arbOwnerPrepareTransactionRequest.ts#L64)
