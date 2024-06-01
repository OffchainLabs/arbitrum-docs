[Documentation](README.md) / getDefaultSequencerInboxMaxTimeVariation

## Functions

### getDefaultSequencerInboxMaxTimeVariation()

```ts
function getDefaultSequencerInboxMaxTimeVariation(parentChainIdOrPublicClient: 
  | 1
  | 421614
  | 1337
  | 412346
  | 42161
  | 42170
  | 11155111
  | 17000
  | object): SequencerInboxMaxTimeVariation
```

Returns the default maximum time variation for the sequencer inbox, including
delay and future blocks and seconds, based on the provided parent chain ID or
public client.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `parentChainIdOrPublicClient` |  \| `1` \| `421614` \| `1337` \| `412346` \| `42161` \| `42170` \| `11155111` \| `17000` \| `object` |

#### Returns

`SequencerInboxMaxTimeVariation`

#### Source

[src/getDefaultSequencerInboxMaxTimeVariation.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/getDefaultSequencerInboxMaxTimeVariation.ts#L17)
