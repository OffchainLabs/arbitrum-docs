---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# sequencerInboxPrepareTransactionRequest

## Type Aliases

### SequencerInboxAbi

> **SequencerInboxAbi**: *typeof* [`abi`](contracts.md#abi-7)

#### Source

[sequencerInboxPrepareTransactionRequest.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/sequencerInboxPrepareTransactionRequest.ts#L15)

***

### SequencerInboxFunctionName

> **SequencerInboxFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`SequencerInboxAbi`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxabi)\>

#### Source

[sequencerInboxPrepareTransactionRequest.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/sequencerInboxPrepareTransactionRequest.ts#L16)

***

### SequencerInboxPrepareTransactionRequestParameters\<TFunctionName\>

> **SequencerInboxPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit`\<`SequencerInboxPrepareFunctionDataParameters`\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: [`mainnet`](chains.md#mainnet)

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

#### Source

[sequencerInboxPrepareTransactionRequest.ts:69](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/sequencerInboxPrepareTransactionRequest.ts#L69)

## Functions

### sequencerInboxPrepareTransactionRequest()

> **sequencerInboxPrepareTransactionRequest**\<`TFunctionName`, `TTransport`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

#### Type parameters

• **TFunctionName** *extends* `"bridge"` \| `"DATA_AUTHENTICATED_FLAG"` \| `"HEADER_LENGTH"` \| `"addSequencerL2Batch"` \| `"addSequencerL2BatchFromOrigin"` \| `"batchCount"` \| `"dasKeySetInfo"` \| `"forceInclusion"` \| `"getKeysetCreationBlock"` \| `"inboxAccs"` \| `"initialize"` \| `"invalidateKeysetHash"` \| `"isBatchPoster"` \| `"isValidKeysetHash"` \| `"maxTimeVariation"` \| `"removeDelayAfterFork"` \| `"rollup"` \| `"setIsBatchPoster"` \| `"setMaxTimeVariation"` \| `"setValidKeyset"` \| `"totalDelayedMessagesRead"`

• **TTransport** *extends* `Transport` = `Transport`

• **TChain** *extends* `unknown` = `any`

#### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

• **params**: [`SequencerInboxPrepareTransactionRequestParameters`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

#### Returns

`Promise`\<`any`\>

#### Source

[sequencerInboxPrepareTransactionRequest.ts:75](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/sequencerInboxPrepareTransactionRequest.ts#L75)
