---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type SequencerInboxPrepareTransactionRequestParameters<TFunctionName>: Omit<SequencerInboxPrepareFunctionDataParameters<TFunctionName>, "abi"> & object;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `account` | `Address` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`SequencerInboxFunctionName`](SequencerInboxFunctionName.md) |

## Source

[src/sequencerInboxPrepareTransactionRequest.ts:69](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/sequencerInboxPrepareTransactionRequest.ts#L69)
