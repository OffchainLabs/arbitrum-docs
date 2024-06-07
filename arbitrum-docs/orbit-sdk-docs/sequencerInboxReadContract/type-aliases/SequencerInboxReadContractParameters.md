[Documentation](../../README.md) / [sequencerInboxReadContract](../README.md) / SequencerInboxReadContractParameters

```ts
type SequencerInboxReadContractParameters<TFunctionName>: object & GetFunctionArgs<SequencerInboxAbi, TFunctionName>;
```

## Type declaration

| Member           | Type            |
| :--------------- | :-------------- |
| `functionName`   | `TFunctionName` |
| `sequencerInbox` | `Address`       |

## Type parameters

| Type parameter                                                                                                                                     |
| :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TFunctionName` _extends_ [`SequencerInboxFunctionName`](../../sequencerInboxPrepareTransactionRequest/type-aliases/SequencerInboxFunctionName.md) |

## Source

[src/sequencerInboxReadContract.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/sequencerInboxReadContract.ts#L16)
