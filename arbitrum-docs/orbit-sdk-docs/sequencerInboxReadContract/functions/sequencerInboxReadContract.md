---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: sequencerInboxReadContract()

> **sequencerInboxReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`SequencerInboxReadContractReturnType`](../type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\>

Reads data from the sequencer inbox contract on a specified chain and returns
the result.

## Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the blockchain chain.

• **TFunctionName** *extends* `"bridge"` \| `"initialize"` \| `"DATA_AUTHENTICATED_FLAG"` \| `"HEADER_LENGTH"` \| `"addSequencerL2Batch"` \| `"addSequencerL2BatchFromOrigin"` \| `"batchCount"` \| `"dasKeySetInfo"` \| `"forceInclusion"` \| `"getKeysetCreationBlock"` \| `"inboxAccs"` \| `"invalidateKeysetHash"` \| `"isBatchPoster"` \| `"isValidKeysetHash"` \| `"maxTimeVariation"` \| `"removeDelayAfterFork"` \| `"rollup"` \| `"setIsBatchPoster"` \| `"setMaxTimeVariation"` \| `"setValidKeyset"` \| `"totalDelayedMessagesRead"`

The name of the function to read from the contract.

## Parameters

• **client**

The public client to interact with the blockchain.

• **params**: [`SequencerInboxReadContractParameters`](../type-aliases/SequencerInboxReadContractParameters.md)\<`TFunctionName`\>

The parameters for reading the contract.

## Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](../type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\>

- A promise that resolves to the result of the contract function.

## Example

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

## Source

[src/sequencerInboxReadContract.ts:50](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/sequencerInboxReadContract.ts#L50)
