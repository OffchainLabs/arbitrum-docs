[Documentation](README.md) / sequencerInboxPrepareTransactionRequest

## Functions

### sequencerInboxPrepareTransactionRequest()

```ts
function sequencerInboxPrepareTransactionRequest<TFunctionName, TTransport, TChain>(
  client: object,
  params: SequencerInboxPrepareTransactionRequestParameters<TFunctionName>,
): Promise<object | object | object>;
```

Prepares a transaction request to interact with the sequencerInbox contract
on a specified chain using the provided PublicClient.

#### Type parameters

| Type parameter | Value |
| :------------- | :---- |

| `TFunctionName` _extends_
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
| `TTransport` _extends_ `Transport` | `Transport` |
| `TChain` _extends_ `undefined` \| `Chain` | `undefined` \| `Chain` |

#### Parameters

| Parameter | Type                                                                   |
| :-------- | :--------------------------------------------------------------------- |
| `client`  | `object`                                                               |
| `params`  | `SequencerInboxPrepareTransactionRequestParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/sequencerInboxPrepareTransactionRequest.ts:79](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/sequencerInboxPrepareTransactionRequest.ts#L79)
