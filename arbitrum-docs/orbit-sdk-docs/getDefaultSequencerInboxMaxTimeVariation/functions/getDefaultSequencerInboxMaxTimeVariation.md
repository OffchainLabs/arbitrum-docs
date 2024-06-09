---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function getDefaultSequencerInboxMaxTimeVariation(parentChainIdOrPublicClient: any): SequencerInboxMaxTimeVariation
```

getDefaultSequencerInboxMaxTimeVariation retrieves the default maximum time
variation for the sequencer inbox based on the provided parent chain ID or
PublicClient. It returns a [SequencerInboxMaxTimeVariation](../type-aliases/SequencerInboxMaxTimeVariation.md) object
containing delayBlocks, futureBlocks, delaySeconds, and futureSeconds values.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `parentChainIdOrPublicClient` | `any` |

## Returns

[`SequencerInboxMaxTimeVariation`](../type-aliases/SequencerInboxMaxTimeVariation.md)

## Source

[src/getDefaultSequencerInboxMaxTimeVariation.ts:18](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/getDefaultSequencerInboxMaxTimeVariation.ts#L18)
