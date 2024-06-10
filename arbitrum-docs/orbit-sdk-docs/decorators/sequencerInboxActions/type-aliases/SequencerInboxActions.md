---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type SequencerInboxActions<TSequencerInbox, TChain>: object;
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TSequencerInbox` *extends* `Address` \| `undefined` | - |
| `TChain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member | Type |
| :------ | :------ |
| `sequencerInboxPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: `SequencerInboxPrepareTransactionRequestArgs`\<`TSequencerInbox`, `TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\> |
| `sequencerInboxReadContract` | \<`TFunctionName`\>(`args`: `SequencerInboxReadContractArgs`\<`TSequencerInbox`, `TFunctionName`\>) => `Promise` \<[`SequencerInboxReadContractReturnType`](../../../sequencerInboxReadContract/type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/sequencerInboxActions.ts:31](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/decorators/sequencerInboxActions.ts#L31)
