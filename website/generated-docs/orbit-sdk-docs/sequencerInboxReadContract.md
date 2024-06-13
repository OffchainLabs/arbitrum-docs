---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# sequencerInboxReadContract

## Type Aliases

### SequencerInboxReadContractParameters\<TFunctionName\>

> **SequencerInboxReadContractParameters**\<`TFunctionName`\>: `object` & [`mainnet`](chains.md#mainnet) \<[`SequencerInboxAbi`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

##### sequencerInbox

> **sequencerInbox**: [`mainnet`](chains.md#mainnet)

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

#### Source

[sequencerInboxReadContract.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/sequencerInboxReadContract.ts#L16)

***

### SequencerInboxReadContractReturnType\<TFunctionName\>

> **SequencerInboxReadContractReturnType**\<`TFunctionName`\>: [`mainnet`](chains.md#mainnet) \<[`SequencerInboxAbi`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

#### Source

[sequencerInboxReadContract.ts:23](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/sequencerInboxReadContract.ts#L23)

## Functions

### sequencerInboxReadContract()

> **sequencerInboxReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`SequencerInboxReadContractReturnType`](sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Type parameters

• **TChain** *extends* `unknown`

• **TFunctionName** *extends* `"bridge"` \| `"DATA_AUTHENTICATED_FLAG"` \| `"HEADER_LENGTH"` \| `"addSequencerL2Batch"` \| `"addSequencerL2BatchFromOrigin"` \| `"batchCount"` \| `"dasKeySetInfo"` \| `"forceInclusion"` \| `"getKeysetCreationBlock"` \| `"inboxAccs"` \| `"initialize"` \| `"invalidateKeysetHash"` \| `"isBatchPoster"` \| `"isValidKeysetHash"` \| `"maxTimeVariation"` \| `"removeDelayAfterFork"` \| `"rollup"` \| `"setIsBatchPoster"` \| `"setMaxTimeVariation"` \| `"setValidKeyset"` \| `"totalDelayedMessagesRead"`

#### Parameters

• **client**: `PublicClient`\<`Transport`, `TChain`\>

• **params**: `any`

#### Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[sequencerInboxReadContract.ts:26](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/sequencerInboxReadContract.ts#L26)
