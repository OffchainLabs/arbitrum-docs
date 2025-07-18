---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### InboxTools

Tools for interacting with the inbox and bridge contracts

#### Properties

| Property         | Modifier  | Type       | Description           |
| :--------------- | :-------- | :--------- | :-------------------- |
| `parentProvider` | `private` | `Provider` | Parent chain provider |

#### Methods

##### estimateArbitrumGas()

```ts
private estimateArbitrumGas(childTransactionRequest: RequiredTransactionRequestType, childProvider: Provider): Promise<GasComponentsWithChildPart>
```

We should use nodeInterface to get the gas estimate is because we
are making a delayed inbox message which doesn't need parent calldata
gas fee part.

###### Parameters

| Parameter                 | Type                             |
| :------------------------ | :------------------------------- |
| `childTransactionRequest` | `RequiredTransactionRequestType` |
| `childProvider`           | `Provider`                       |

###### Returns

`Promise`\<`GasComponentsWithChildPart`\>

###### Source

[inbox/inbox.ts:156](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L156)

##### findFirstBlockBelow()

```ts
private findFirstBlockBelow(blockNumber: number, blockTimestamp: number): Promise<Block>
```

Find the first (or close to first) block whose number
is below the provided number, and whose timestamp is below
the provided timestamp

###### Parameters

| Parameter        | Type     | Description |
| :--------------- | :------- | :---------- |
| `blockNumber`    | `number` |             |
| `blockTimestamp` | `number` |             |

###### Returns

`Promise`\<`Block`\>

###### Source

[inbox/inbox.ts:87](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L87)

##### forceInclude()

```ts
forceInclude<T>(messageDeliveredEvent?: T, overrides?: Overrides): Promise<T extends ForceInclusionParams ? ContractTransaction : null | ContractTransaction>
```

Force includes all eligible messages in the delayed inbox.
The inbox contract doesn't allow a message to be force-included
until after a delay period has been completed.

###### Type parameters

| Type parameter                                      |
| :-------------------------------------------------- |
| `T` _extends_ `undefined` \| `ForceInclusionParams` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                  |
| :----------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `messageDeliveredEvent`? | `T`         | Provide this to include all messages up to this one. Responsibility is on the caller to check the eligibility of this event. |
| `overrides`?             | `Overrides` | -                                                                                                                            |

###### Returns

`Promise`\<`T` _extends_ `ForceInclusionParams` ? `ContractTransaction` : `null` \| `ContractTransaction`\>

The force include transaction, or null if no eligible message were found for inclusion

###### Source

[inbox/inbox.ts:356](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L356)

##### getEventsAndIncreaseRange()

```ts
private getEventsAndIncreaseRange(
   bridge: Bridge,
   searchRangeBlocks: number,
   maxSearchRangeBlocks: number,
rangeMultiplier: number): Promise<FetchedEvent<MessageDeliveredEvent>[]>
```

Look for force includable events in the search range blocks, if no events are found the search range is
increased incrementally up to the max search range blocks.

###### Parameters

| Parameter              | Type     | Description |
| :--------------------- | :------- | :---------- |
| `bridge`               | `Bridge` |             |
| `searchRangeBlocks`    | `number` |             |
| `maxSearchRangeBlocks` | `number` |             |
| `rangeMultiplier`      | `number` | -           |

###### Returns

`Promise`\<`FetchedEvent`\<`MessageDeliveredEvent`\>[]\>

###### Source

[inbox/inbox.ts:256](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L256)

##### getForceIncludableBlockRange()

```ts
private getForceIncludableBlockRange(blockNumberRangeSize: number): Promise<object>
```

Get a range of blocks within messages eligible for force inclusion emitted events

###### Parameters

| Parameter              | Type     | Description |
| :--------------------- | :------- | :---------- |
| `blockNumberRangeSize` | `number` |             |

###### Returns

`Promise`\<`object`\>

| Member       | Type     | Value                     |
| :----------- | :------- | :------------------------ |
| `endBlock`   | `number` | firstEligibleBlock.number |
| `startBlock` | `number` | ...                       |

###### Source

[inbox/inbox.ts:186](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L186)

##### getForceIncludableEvent()

```ts
getForceIncludableEvent(
   maxSearchRangeBlocks: number,
   startSearchRangeBlocks: number,
rangeMultiplier: number): Promise<null | ForceInclusionParams>
```

Find the event of the latest message that can be force include

###### Parameters

| Parameter                | Type     | Default value | Description                                                                                                      |
| :----------------------- | :------- | :------------ | :--------------------------------------------------------------------------------------------------------------- |
| `maxSearchRangeBlocks`   | `number` | `undefined`   | The max range of blocks to search in.<br />Defaults to 3 \* 6545 ( = ~3 days) prior to the first eligible block  |
| `startSearchRangeBlocks` | `number` | `100`         | The start range of block to search in.<br />Moves incrementally up to the maxSearchRangeBlocks. Defaults to 100; |
| `rangeMultiplier`        | `number` | `2`           | The multiplier to use when increasing the block range<br />Defaults to 2.                                        |

###### Returns

`Promise`\<`null` \| `ForceInclusionParams`\>

Null if non can be found.

###### Source

[inbox/inbox.ts:307](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L307)

##### sendChildSignedTx()

```ts
sendChildSignedTx(signedTx: string): Promise<null | ContractTransaction>
```

Send Child Chain signed tx using delayed inbox, which won't alias the sender's address
It will be automatically included by the sequencer on Chain, if it isn't included
within 24 hours, you can force include it

###### Parameters

| Parameter  | Type     | Description                                                                                                     |
| :--------- | :------- | :-------------------------------------------------------------------------------------------------------------- |
| `signedTx` | `string` | A signed transaction which can be sent directly to chain,<br />you can call inboxTools.signChainMessage to get. |

###### Returns

`Promise`\<`null` \| `ContractTransaction`\>

The parent delayed inbox's transaction itself.

###### Source

[inbox/inbox.ts:401](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L401)

##### signChildTx()

```ts
signChildTx(txRequest: RequiredTransactionRequestType, childSigner: Signer): Promise<string>
```

Sign a transaction with msg.to, msg.value and msg.data.
You can use this as a helper to call inboxTools.sendChainSignedMessage
above.

###### Parameters

| Parameter     | Type                             | Description                                                                                                                                                                                                                                                                                                                               |
| :------------ | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `txRequest`   | `RequiredTransactionRequestType` | A signed transaction which can be sent directly to chain,<br />tx.to, tx.data, tx.value must be provided when not contract creation, if<br />contractCreation is true, no need provide tx.to. tx.gasPrice and tx.nonce<br />can be overrided. (You can also send contract creation transaction by set tx.to<br />to zero address or null) |
| `childSigner` | `Signer`                         | ethers Signer type, used to sign Chain transaction                                                                                                                                                                                                                                                                                        |

###### Returns

`Promise`\<`string`\>

The parent delayed inbox's transaction signed data.

###### Source

[inbox/inbox.ts:429](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/inbox/inbox.ts#L429)
