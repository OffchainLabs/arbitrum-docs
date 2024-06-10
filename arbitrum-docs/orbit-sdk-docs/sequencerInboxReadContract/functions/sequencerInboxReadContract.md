---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function sequencerInboxReadContract<TChain, TFunctionName>(client: object, params: SequencerInboxReadContractParameters<TFunctionName>): Promise<SequencerInboxReadContractReturnType<TFunctionName>>
```

## Type parameters

| Type parameter |
| :------ |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |
| `TFunctionName` *extends* 
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

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | [`SequencerInboxReadContractParameters`](../type-aliases/SequencerInboxReadContractParameters.md)\<`TFunctionName`\> |

## Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](../type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/sequencerInboxReadContract.ts:26](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/sequencerInboxReadContract.ts#L26)
