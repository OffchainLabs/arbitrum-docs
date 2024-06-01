[Documentation](README.md) / sequencerInboxReadContract

## Functions

### sequencerInboxReadContract()

```ts
function sequencerInboxReadContract<TChain, TFunctionName>(client: object, params: SequencerInboxReadContractParameters<TFunctionName>): Promise<SequencerInboxReadContractReturnType<TFunctionName>>
```

Reads data from the sequencer inbox contract specified by the provided
address and function name, returning the result as a Promise.

#### Type parameters

| Type parameter |
| :------ |
| `TChain` *extends* `undefined` \| `Chain` |
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

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | `SequencerInboxReadContractParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`SequencerInboxReadContractReturnType`\<`TFunctionName`\>\>

#### Source

[src/sequencerInboxReadContract.ts:30](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/sequencerInboxReadContract.ts#L30)
