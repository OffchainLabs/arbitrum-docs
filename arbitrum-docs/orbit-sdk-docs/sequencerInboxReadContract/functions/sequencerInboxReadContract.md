---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function sequencerInboxReadContract<TChain, TFunctionName>(
  client: object,
  params: SequencerInboxReadContractParameters<TFunctionName>,
): Promise<SequencerInboxReadContractReturnType<TFunctionName>>;
```

Reads data from the sequencer inbox contract on a specified chain and returns
the result.

## Type parameters

| Type parameter                                                                |
| :---------------------------------------------------------------------------- |
| `TChain` _extends_ `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

| `TFunctionName` _extends_
\| `"bridge"`
\| `"initialize"`
\| `"DATA_AUTHENTICATED_FLAG"`
\| `"HEADER_LENGTH"`
\| `"addSequencerL2Batch"`
\| `"addSequencerL2BatchFromOrigin"`
\| `"batchCount"`
\| `"dasKeySetInfo"`
\| `"forceInclusion"`
\| `"getKeysetCreationBlock"`
\| `"inboxAccs"`
\| `"invalidateKeysetHash"`
\| `"isBatchPoster"`
\| `"isValidKeysetHash"`
\| `"maxTimeVariation"`
\| `"removeDelayAfterFork"`
\| `"rollup"`
\| `"setIsBatchPoster"`
\| `"setMaxTimeVariation"`
\| `"setValidKeyset"`
\| `"totalDelayedMessagesRead"` |

## Parameters

| Parameter | Type                                                                                                                 |
| :-------- | :------------------------------------------------------------------------------------------------------------------- |
| `client`  | `object`                                                                                                             |
| `params`  | [`SequencerInboxReadContractParameters`](../type-aliases/SequencerInboxReadContractParameters.md)\<`TFunctionName`\> |

## Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](../type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/sequencerInboxReadContract.ts:30](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/sequencerInboxReadContract.ts#L30)
