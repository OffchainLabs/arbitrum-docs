---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: sequencerInboxPrepareTransactionRequest()

> **sequencerInboxPrepareTransactionRequest**\<`TFunctionName`, `TTransport`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

Prepares a transaction request to interact with the Sequencer Inbox contract on a specified chain.

## Type parameters

• **TFunctionName** *extends* `"bridge"` \| `"initialize"` \| `"DATA_AUTHENTICATED_FLAG"` \| `"HEADER_LENGTH"` \| `"addSequencerL2Batch"` \| `"addSequencerL2BatchFromOrigin"` \| `"batchCount"` \| `"dasKeySetInfo"` \| `"forceInclusion"` \| `"getKeysetCreationBlock"` \| `"inboxAccs"` \| `"invalidateKeysetHash"` \| `"isBatchPoster"` \| `"isValidKeysetHash"` \| `"maxTimeVariation"` \| `"removeDelayAfterFork"` \| `"rollup"` \| `"setIsBatchPoster"` \| `"setMaxTimeVariation"` \| `"setValidKeyset"` \| `"totalDelayedMessagesRead"`

The name of the function to call on the Sequencer Inbox contract.

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

The transport type for the PublicClient.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The chain type.

## Parameters

• **client**

The public client to use for the transaction.

• **params**: [`SequencerInboxPrepareTransactionRequestParameters`](../type-aliases/SequencerInboxPrepareTransactionRequestParameters.md)\<`TFunctionName`\>

The parameters for the transaction request.

## Returns

`Promise`\<`any`\>

The prepared transaction request object.

## Source

[src/sequencerInboxPrepareTransactionRequest.ts:111](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/sequencerInboxPrepareTransactionRequest.ts#L111)
