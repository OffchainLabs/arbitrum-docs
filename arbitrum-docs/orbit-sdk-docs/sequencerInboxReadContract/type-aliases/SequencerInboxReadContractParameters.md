---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type SequencerInboxReadContractParameters<TFunctionName>: object & GetFunctionArgs<SequencerInboxAbi, TFunctionName>;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `functionName` | `TFunctionName` |
| `sequencerInbox` | `Address` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`SequencerInboxFunctionName`](../../sequencerInboxPrepareTransactionRequest/type-aliases/SequencerInboxFunctionName.md) |

## Source

[src/sequencerInboxReadContract.ts:16](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/sequencerInboxReadContract.ts#L16)
