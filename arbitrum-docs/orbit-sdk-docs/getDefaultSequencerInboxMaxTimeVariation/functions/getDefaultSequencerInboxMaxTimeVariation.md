---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: getDefaultSequencerInboxMaxTimeVariation()

> **getDefaultSequencerInboxMaxTimeVariation**(`parentChainIdOrPublicClient`): [`SequencerInboxMaxTimeVariation`](../type-aliases/SequencerInboxMaxTimeVariation.md)

Retrieves the default maximum time variation for the sequencer inbox.

## Parameters

• **parentChainIdOrPublicClient**: `any`

The parent chain ID or PublicClient.
  If a ParentChainId is provided, it will be validated.
  If a PublicClient is provided, it will be used to determine the parent chain ID.

## Returns

[`SequencerInboxMaxTimeVariation`](../type-aliases/SequencerInboxMaxTimeVariation.md)

- An object containing delayBlocks, futureBlocks, delaySeconds, and futureSeconds values.

## Example

```ts
const parentChainId = 1n; // Example parent chain ID
const timeVariation = getDefaultSequencerInboxMaxTimeVariation(parentChainId);
console.log(timeVariation);
// Output:
// {
//   delayBlocks: 28800n,
//   futureBlocks: 300n,
//   delaySeconds: 345600n,
//   futureSeconds: 3600n
// }
```

## Source

[src/getDefaultSequencerInboxMaxTimeVariation.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/getDefaultSequencerInboxMaxTimeVariation.ts#L33)
