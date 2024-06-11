---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# sequencerInboxReadContract

## Type Aliases

### SequencerInboxReadContractParameters\<TFunctionName\>

> **SequencerInboxReadContractParameters**\<`TFunctionName`\>: `object` & `GetFunctionArgs` \<[`SequencerInboxAbi`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

##### sequencerInbox

> **sequencerInbox**: `Address`

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

#### Source

[src/sequencerInboxReadContract.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/sequencerInboxReadContract.ts#L16)

***

### SequencerInboxReadContractReturnType\<TFunctionName\>

> **SequencerInboxReadContractReturnType**\<`TFunctionName`\>: `ReadContractReturnType` \<[`SequencerInboxAbi`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

#### Source

[src/sequencerInboxReadContract.ts:23](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/sequencerInboxReadContract.ts#L23)

## Functions

### sequencerInboxReadContract()

> **sequencerInboxReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`SequencerInboxReadContractReturnType`](sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

Reads data from the sequencer inbox contract on a specified chain and returns
the result.

#### Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the blockchain chain.

• **TFunctionName** *extends* `"bridge"` \| `"initialize"` \| `"DATA_AUTHENTICATED_FLAG"` \| `"HEADER_LENGTH"` \| `"addSequencerL2Batch"` \| `"addSequencerL2BatchFromOrigin"` \| `"batchCount"` \| `"dasKeySetInfo"` \| `"forceInclusion"` \| `"getKeysetCreationBlock"` \| `"inboxAccs"` \| `"invalidateKeysetHash"` \| `"isBatchPoster"` \| `"isValidKeysetHash"` \| `"maxTimeVariation"` \| `"removeDelayAfterFork"` \| `"rollup"` \| `"setIsBatchPoster"` \| `"setMaxTimeVariation"` \| `"setValidKeyset"` \| `"totalDelayedMessagesRead"`

The name of the function to read from the contract.

#### Parameters

• **client**

The public client to interact with the blockchain.

• **params**: [`SequencerInboxReadContractParameters`](sequencerInboxReadContract.md#sequencerinboxreadcontractparameterstfunctionname)\<`TFunctionName`\>

The parameters for reading the contract.

#### Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

- A promise that resolves to the result of the contract function.

#### Example

```ts
const client = new PublicClient(...);
const params = {
  functionName: 'getInboxAccumulators',
  sequencerInbox: '0x1234...abcd',
  args: [],
};
const result = await sequencerInboxReadContract(client, params);
console.log(result);
```

#### Source

[src/sequencerInboxReadContract.ts:50](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/sequencerInboxReadContract.ts#L50)
