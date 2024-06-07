[Documentation](../../README.md) / [sequencerInboxPrepareTransactionRequest](../README.md) / SequencerInboxPrepareTransactionRequestParameters

```ts
type SequencerInboxPrepareTransactionRequestParameters<TFunctionName>: Omit<SequencerInboxPrepareFunctionDataParameters<TFunctionName>, "abi"> & object;
```

## Type declaration

| Member    | Type      |
| :-------- | :-------- |
| `account` | `Address` |

## Type parameters

| Type parameter                                                                          |
| :-------------------------------------------------------------------------------------- |
| `TFunctionName` _extends_ [`SequencerInboxFunctionName`](SequencerInboxFunctionName.md) |

## Source

[src/sequencerInboxPrepareTransactionRequest.ts:69](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/sequencerInboxPrepareTransactionRequest.ts#L69)
