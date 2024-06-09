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

[src/decorators/sequencerInboxActions.ts:31](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/sequencerInboxActions.ts#L31)
