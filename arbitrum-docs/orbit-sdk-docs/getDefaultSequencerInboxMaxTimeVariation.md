---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# getDefaultSequencerInboxMaxTimeVariation

## Type Aliases

### SequencerInboxMaxTimeVariation

> **SequencerInboxMaxTimeVariation**: `object`

#### Type declaration

##### delayBlocks

> **delayBlocks**: `bigint`

##### delaySeconds

> **delaySeconds**: `bigint`

##### futureBlocks

> **futureBlocks**: `bigint`

##### futureSeconds

> **futureSeconds**: `bigint`

#### Source

[src/getDefaultSequencerInboxMaxTimeVariation.ts:5](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/getDefaultSequencerInboxMaxTimeVariation.ts#L5)

## Functions

### getDefaultSequencerInboxMaxTimeVariation()

> **getDefaultSequencerInboxMaxTimeVariation**(`parentChainIdOrPublicClient`): [`SequencerInboxMaxTimeVariation`](getDefaultSequencerInboxMaxTimeVariation.md#sequencerinboxmaxtimevariation)

Retrieves the default maximum time variation for the sequencer inbox.

#### Parameters

• **parentChainIdOrPublicClient**: `any`

The parent chain ID or PublicClient.
  If a ParentChainId is provided, it will be validated.
  If a PublicClient is provided, it will be used to determine the parent chain ID.

#### Returns

[`SequencerInboxMaxTimeVariation`](getDefaultSequencerInboxMaxTimeVariation.md#sequencerinboxmaxtimevariation)

- An object containing delayBlocks, futureBlocks, delaySeconds, and futureSeconds values.

#### Example

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

#### Source

[src/getDefaultSequencerInboxMaxTimeVariation.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/getDefaultSequencerInboxMaxTimeVariation.ts#L33)
