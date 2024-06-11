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

[src/sequencerInboxPrepareTransactionRequest.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/sequencerInboxPrepareTransactionRequest.ts#L15)

***

### SequencerInboxFunctionName

> **SequencerInboxFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`SequencerInboxAbi`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxabi)\>

#### Source

[src/sequencerInboxPrepareTransactionRequest.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/sequencerInboxPrepareTransactionRequest.ts#L16)

***

### SequencerInboxPrepareTransactionRequestParameters\<TFunctionName\>

> **SequencerInboxPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit`\<`SequencerInboxPrepareFunctionDataParameters`\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: `Address`

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

#### Source

[src/sequencerInboxPrepareTransactionRequest.ts:90](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/sequencerInboxPrepareTransactionRequest.ts#L90)

## Functions

### sequencerInboxPrepareTransactionRequest()

> **sequencerInboxPrepareTransactionRequest**\<`TFunctionName`, `TTransport`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

Prepares a transaction request to interact with the Sequencer Inbox contract on a specified chain.

#### Type parameters

• **TFunctionName** *extends* `"bridge"` \| `"initialize"` \| `"DATA_AUTHENTICATED_FLAG"` \| `"HEADER_LENGTH"` \| `"addSequencerL2Batch"` \| `"addSequencerL2BatchFromOrigin"` \| `"batchCount"` \| `"dasKeySetInfo"` \| `"forceInclusion"` \| `"getKeysetCreationBlock"` \| `"inboxAccs"` \| `"invalidateKeysetHash"` \| `"isBatchPoster"` \| `"isValidKeysetHash"` \| `"maxTimeVariation"` \| `"removeDelayAfterFork"` \| `"rollup"` \| `"setIsBatchPoster"` \| `"setMaxTimeVariation"` \| `"setValidKeyset"` \| `"totalDelayedMessagesRead"`

The name of the function to call on the Sequencer Inbox contract.

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

The transport type for the PublicClient.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The chain type.

#### Parameters

• **client**

The public client to use for the transaction.

• **params**: [`SequencerInboxPrepareTransactionRequestParameters`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

The parameters for the transaction request.

#### Returns

`Promise`\<`any`\>

The prepared transaction request object.

#### Source

[src/sequencerInboxPrepareTransactionRequest.ts:111](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/sequencerInboxPrepareTransactionRequest.ts#L111)
