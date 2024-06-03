---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function sequencerInboxPrepareTransactionRequest<TFunctionName, TTransport, TChain>(client: object, params: SequencerInboxPrepareTransactionRequestParameters<TFunctionName>): Promise<any>
```

sequencerInboxPrepareTransactionRequest prepares a transaction request to
interact with the Sequencer Inbox contract on a specified chain. It takes in
a PublicClient and parameters including the function name, arguments, upgrade
executor, and account address. The function generates the transaction data
and value based on the parameters provided and returns a prepared transaction
request object.

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
| `params` | `SequencerInboxPrepareTransactionRequestParameters`\<`TFunctionName`\> |

## Returns

`Promise`\<`any`\>

## Source

[src/sequencerInboxPrepareTransactionRequest.ts:83](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/sequencerInboxPrepareTransactionRequest.ts#L83)
