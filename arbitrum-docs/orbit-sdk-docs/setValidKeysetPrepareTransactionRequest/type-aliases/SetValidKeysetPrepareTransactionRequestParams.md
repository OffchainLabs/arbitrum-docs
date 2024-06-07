[Documentation](../../README.md) / [setValidKeysetPrepareTransactionRequest](../README.md) / SetValidKeysetPrepareTransactionRequestParams

```ts
type SetValidKeysetPrepareTransactionRequestParams<TChain>: Omit<SetValidKeysetParams<TChain>, "walletClient"> & object;
```

## Type declaration

| Member    | Type      |
| :-------- | :-------- |
| `account` | `Address` |

## Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `Chain` \| `undefined` |

## Source

[src/setValidKeysetPrepareTransactionRequest.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/setValidKeysetPrepareTransactionRequest.ts#L8)
