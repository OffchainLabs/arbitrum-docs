---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function sequencerInboxPrepareTransactionRequest<TFunctionName, TTransport, TChain>(client: object, params: SequencerInboxPrepareTransactionRequestParameters<TFunctionName>): Promise<any>
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
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
  \| `"totalDelayedMessagesRead"` | - |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | [`SequencerInboxPrepareTransactionRequestParameters`](../type-aliases/SequencerInboxPrepareTransactionRequestParameters.md)\<`TFunctionName`\> |

## Returns

`Promise`\<`any`\>

## Source

[src/sequencerInboxPrepareTransactionRequest.ts:75](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/sequencerInboxPrepareTransactionRequest.ts#L75)
