## Classes

### InboxTools

Defined in: inbox/inbox.ts:64

Tools for interacting with the inbox and bridge contracts

#### Methods

##### forceInclude()

```ts
forceInclude<T>(messageDeliveredEvent?: T, overrides?: Overrides): Promise<T extends ForceInclusionParams ? ContractTransaction : ContractTransaction | null>;
```

Defined in: inbox/inbox.ts:356

Force includes all eligible messages in the delayed inbox.
The inbox contract doesn't allow a message to be force-included
until after a delay period has been completed.

###### Type Parameters

| Type Parameter                                      |
| --------------------------------------------------- |
| `T` _extends_ `ForceInclusionParams` \| `undefined` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                  |
| ------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `messageDeliveredEvent?` | `T`         | Provide this to include all messages up to this one. Responsibility is on the caller to check the eligibility of this event. |
| `overrides?`             | `Overrides` | -                                                                                                                            |

###### Returns

`Promise`\<`T` _extends_ `ForceInclusionParams` ? `ContractTransaction` : `ContractTransaction` \| `null`\>

The force include transaction, or null if no eligible message were found for inclusion

##### getForceIncludableEvent()

```ts
getForceIncludableEvent(
   maxSearchRangeBlocks: number,
   startSearchRangeBlocks: number,
rangeMultiplier: number): Promise<ForceInclusionParams | null>;
```

Defined in: inbox/inbox.ts:307

Find the event of the latest message that can be force include

###### Parameters

| Parameter                | Type     | Default value | Description                                                                                                 |
| ------------------------ | -------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| `maxSearchRangeBlocks`   | `number` | `...`         | The max range of blocks to search in. Defaults to 3 \* 6545 ( = ~3 days) prior to the first eligible block  |
| `startSearchRangeBlocks` | `number` | `100`         | The start range of block to search in. Moves incrementally up to the maxSearchRangeBlocks. Defaults to 100; |
| `rangeMultiplier`        | `number` | `2`           | The multiplier to use when increasing the block range Defaults to 2.                                        |

###### Returns

`Promise`\<`ForceInclusionParams` \| `null`\>

Null if non can be found.

##### sendChildSignedTx()

```ts
sendChildSignedTx(signedTx: string): Promise<ContractTransaction | null>;
```

Defined in: inbox/inbox.ts:401

Send Child Chain signed tx using delayed inbox, which won't alias the sender's address
It will be automatically included by the sequencer on Chain, if it isn't included
within 24 hours, you can force include it

###### Parameters

| Parameter  | Type     | Description                                                                                                |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `signedTx` | `string` | A signed transaction which can be sent directly to chain, you can call inboxTools.signChainMessage to get. |

###### Returns

`Promise`\<`ContractTransaction` \| `null`\>

The parent delayed inbox's transaction itself.

##### signChildTx()

```ts
signChildTx(txRequest: RequiredTransactionRequestType, childSigner: Signer): Promise<string>;
```

Defined in: inbox/inbox.ts:429

Sign a transaction with msg.to, msg.value and msg.data.
You can use this as a helper to call inboxTools.sendChainSignedMessage
above.

###### Parameters

| Parameter     | Type                             | Description                                                                                                                                                                                                                                                                                                           |
| ------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `txRequest`   | `RequiredTransactionRequestType` | A signed transaction which can be sent directly to chain, tx.to, tx.data, tx.value must be provided when not contract creation, if contractCreation is true, no need provide tx.to. tx.gasPrice and tx.nonce can be overrided. (You can also send contract creation transaction by set tx.to to zero address or null) |
| `childSigner` | `Signer`                         | ethers Signer type, used to sign Chain transaction                                                                                                                                                                                                                                                                    |

###### Returns

`Promise`\<`string`\>

The parent delayed inbox's transaction signed data.
