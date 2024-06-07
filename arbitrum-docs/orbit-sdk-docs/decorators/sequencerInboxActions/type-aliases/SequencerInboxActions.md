[Documentation](../../../README.md) / [decorators/sequencerInboxActions](../README.md) / SequencerInboxActions

```ts
type SequencerInboxActions<TSequencerInbox, TChain>: object;
```

## Type parameters

| Type parameter                                       | Value                  |
| :--------------------------------------------------- | :--------------------- |
| `TSequencerInbox` _extends_ `Address` \| `undefined` | -                      |
| `TChain` _extends_ `Chain` \| `undefined`            | `Chain` \| `undefined` |

## Type declaration

| Member                                    | Type                                                                                                                                                                                                                                                                      |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sequencerInboxPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: `SequencerInboxPrepareTransactionRequestArgs`\<`TSequencerInbox`, `TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>                                                                             |
| `sequencerInboxReadContract`              | \<`TFunctionName`\>(`args`: `SequencerInboxReadContractArgs`\<`TSequencerInbox`, `TFunctionName`\>) => `Promise`\<[`SequencerInboxReadContractReturnType`](../../../sequencerInboxReadContract/type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/sequencerInboxActions.ts:31](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/decorators/sequencerInboxActions.ts#L31)
