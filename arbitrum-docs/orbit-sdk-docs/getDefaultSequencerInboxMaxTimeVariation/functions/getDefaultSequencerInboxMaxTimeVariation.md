---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function getDefaultSequencerInboxMaxTimeVariation(
  parentChainIdOrPublicClient: any,
): SequencerInboxMaxTimeVariation;
```

getDefaultSequencerInboxMaxTimeVariation retrieves the default maximum time
variation for the sequencer inbox based on the provided parent chain ID or
PublicClient. It returns a SequencerInboxMaxTimeVariation object
containing delayBlocks, futureBlocks, delaySeconds, and futureSeconds values.

## Parameters

| Parameter                     | Type  |
| :---------------------------- | :---- |
| `parentChainIdOrPublicClient` | `any` |

## Returns

`SequencerInboxMaxTimeVariation`

## Source

[src/getDefaultSequencerInboxMaxTimeVariation.ts:18](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/getDefaultSequencerInboxMaxTimeVariation.ts#L18)
