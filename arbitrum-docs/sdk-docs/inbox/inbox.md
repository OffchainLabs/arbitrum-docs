---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### InboxTools

Tools for interacting with the inbox and bridge contracts

#### Properties

| Property     | Modifier  | Type                                                                                                         | Description                                                      |
| :----------- | :-------- | :----------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `l1Network`  | `private` | [`L1Network`](../dataEntities/networks.md#l1network) \| [`L2Network`](../dataEntities/networks.md#l2network) | Parent chain for the given Arbitrum chain, can be an L1 or an L2 |
| `l1Provider` | `private` | `Provider`                                                                                                   | Parent chain provider                                            |

#### Methods

##### estimateArbitrumGas()

```ts
private estimateArbitrumGas(transactionl2Request: RequiredTransactionRequestType, l2Provider: Provider): Promise<GasComponentsWithL2Part>
```

We should use nodeInterface to get the gas estimate is because we
are making a delayed inbox message which doesn't need l1 calldata
gas fee part.

###### Parameters

| Parameter              | Type                             |
| :--------------------- | :------------------------------- |
| `transactionl2Request` | `RequiredTransactionRequestType` |
| `l2Provider`           | `Provider`                       |

###### Returns

`Promise`\<`GasComponentsWithL2Part`\>

###### Source

[inbox/inbox.ts:163](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L163)

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

[inbox/inbox.ts:94](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L94)

##### forceInclude()

```ts
forceInclude<T>(messageDeliveredEvent?: T, overrides?: Overrides): Promise<T extends ForceInclusionParams ? ContractTransaction : null | ContractTransaction>
```

Force includes all eligible messages in the delayed inbox.
The inbox contract doesnt allow a message to be force-included
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

[inbox/inbox.ts:363](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L363)

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

[inbox/inbox.ts:263](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L263)

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

[inbox/inbox.ts:193](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L193)

##### getForceIncludableEvent()

```ts
getForceIncludableEvent(
   maxSearchRangeBlocks: number,
   startSearchRangeBlocks: number,
rangeMultipler: number): Promise<null | ForceInclusionParams>
```

Find the event of the latest message that can be force include

###### Parameters

| Parameter                | Type     | Default value | Description                                                                                                      |
| :----------------------- | :------- | :------------ | :--------------------------------------------------------------------------------------------------------------- |
| `maxSearchRangeBlocks`   | `number` | `undefined`   | The max range of blocks to search in.<br />Defaults to 3 \* 6545 ( = ~3 days) prior to the first eligble block   |
| `startSearchRangeBlocks` | `number` | `100`         | The start range of block to search in.<br />Moves incrementally up to the maxSearchRangeBlocks. Defaults to 100; |
| `rangeMultipler`         | `number` | `2`           | -                                                                                                                |

###### Returns

`Promise`\<`null` \| `ForceInclusionParams`\>

Null if non can be found.

###### Source

[inbox/inbox.ts:314](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L314)

##### sendL2SignedTx()

```ts
sendL2SignedTx(signedTx: string): Promise<null | ContractTransaction>
```

Send l2 signed tx using delayed inox, which won't alias the sender's adddress
It will be automatically included by the sequencer on l2, if it isn't included
within 24 hours, you can force include it

###### Parameters

| Parameter  | Type     | Description                                                                                                    |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------- |
| `signedTx` | `string` | A signed transaction which can be sent directly to network,<br />you can call inboxTools.signL2Message to get. |

###### Returns

`Promise`\<`null` \| `ContractTransaction`\>

The l1 delayed inbox's transaction itself.

###### Source

[inbox/inbox.ts:408](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L408)

##### signL2Tx()

```ts
signL2Tx(txRequest: RequiredTransactionRequestType, l2Signer: Signer): Promise<string>
```

Sign a transaction with msg.to, msg.value and msg.data.
You can use this as a helper to call inboxTools.sendL2SignedMessage
above.

###### Parameters

| Parameter   | Type                             | Description                                     |
| :---------- | :------------------------------- | :---------------------------------------------- |
| `txRequest` | `RequiredTransactionRequestType` | -                                               |
| `l2Signer`  | `Signer`                         | ethers Signer type, used to sign l2 transaction |

###### Returns

`Promise`\<`string`\>

The l1 delayed inbox's transaction signed data.

###### Source

[inbox/inbox.ts:436](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/inbox/inbox.ts#L436)
