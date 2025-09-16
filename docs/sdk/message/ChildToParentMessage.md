---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ChildToParentMessage

Base functionality for Child-to-Parent messages

#### Extended by

- [`ChildToParentMessageReader`](ChildToParentMessage.md#childtoparentmessagereader)

#### Methods

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: ChildToParentTransactionEvent,
parentProvider?: Provider): ChildToParentMessageReaderOrWriter<T>
```

Instantiates a new `ChildToParentMessageWriter` or `ChildToParentMessageReader` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                            | Description                                                                                                                                                                              |
| :----------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                             | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `parentProvider`?        | `Provider`                      | Optional. Used to override the Provider which is attached to `ParentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriter`](ChildToParentMessage.md#childtoparentmessagereaderorwritert)\<`T`\>

###### Source

[message/ChildToParentMessage.ts:76](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L76)

##### getChildToParentEvents()

```ts
static getChildToParentEvents(
   childProvider: Provider,
   filter: object,
   position?: BigNumber,
   destination?: string,
   hash?: BigNumber,
indexInBatch?: BigNumber): Promise<ChildToParentTransactionEvent & object[]>
```

Get event logs for ChildToParent transactions.

###### Parameters

| Parameter          | Type        | Description                                                                                                                                                                                                                                                                            |
| :----------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`    | `Provider`  |                                                                                                                                                                                                                                                                                        |
| `filter`           | `object`    | Block range filter                                                                                                                                                                                                                                                                     |
| `filter.fromBlock` | `BlockTag`  | -                                                                                                                                                                                                                                                                                      |
| `filter.toBlock`?  | `BlockTag`  | -                                                                                                                                                                                                                                                                                      |
| `position`?        | `BigNumber` | The batchnumber indexed field was removed in nitro and a position indexed field was added.<br />For pre-nitro events the value passed in here will be used to find events with the same batchnumber.<br />For post nitro events it will be used to find events with the same position. |
| `destination`?     | `string`    | The parent destination of the ChildToParent message                                                                                                                                                                                                                                    |
| `hash`?            | `BigNumber` | The uniqueId indexed field was removed in nitro and a hash indexed field was added.<br />For pre-nitro events the value passed in here will be used to find events with the same uniqueId.<br />For post nitro events it will be used to find events with the same hash.               |
| `indexInBatch`?    | `BigNumber` | The index in the batch, only valid for pre-nitro events. This parameter is ignored post-nitro                                                                                                                                                                                          |

###### Returns

`Promise`\<`ChildToParentTransactionEvent` & `object`[]\>

Any classic and nitro events that match the provided filters.

###### Source

[message/ChildToParentMessage.ts:109](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L109)

---

### ChildToParentMessageReader

Provides read-only access for Child-to-Parent messages

#### Extends

- [`ChildToParentMessage`](ChildToParentMessage.md#childtoparentmessage)

#### Extended by

- [`ChildToParentMessageWriter`](ChildToParentMessage.md#childtoparentmessagewriter)

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<null | BigNumber>
```

Estimates the Parent block number in which this Child-to-Parent tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

expected Parent block number where the Child-to-Parent message will be executable. Returns null if the message can or already has been executed

###### Source

[message/ChildToParentMessage.ts:273](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L273)

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>
```

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       |
| :-------------- | :--------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

###### Source

[message/ChildToParentMessage.ts:237](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L237)

##### waitUntilReadyToExecute()

```ts
waitUntilReadyToExecute(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
```

Waits until the outbox entry has been created, and will not return until it has been.
WARNING: Outbox entries are only created when the corresponding node is confirmed. Which
can take 1 week+, so waiting here could be a very long operation.

###### Parameters

| Parameter       | Type       | Default value | Description |
| :-------------- | :--------- | :------------ | :---------- |
| `childProvider` | `Provider` | `undefined`   | -           |
| `retryDelay`    | `number`   | `500`         |             |

###### Returns

`Promise`\<`CONFIRMED` \| `EXECUTED`\>

outbox entry status (either executed or confirmed but not pending)

###### Source

[message/ChildToParentMessage.ts:252](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L252)

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: ChildToParentTransactionEvent,
parentProvider?: Provider): ChildToParentMessageReaderOrWriter<T>
```

Instantiates a new `ChildToParentMessageWriter` or `ChildToParentMessageReader` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                            | Description                                                                                                                                                                              |
| :----------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                             | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `parentProvider`?        | `Provider`                      | Optional. Used to override the Provider which is attached to `ParentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriter`](ChildToParentMessage.md#childtoparentmessagereaderorwritert)\<`T`\>

###### Inherited from

[`ChildToParentMessage`](ChildToParentMessage.md#childtoparentmessage) . [`fromEvent`](ChildToParentMessage.md#fromevent)

###### Source

[message/ChildToParentMessage.ts:76](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L76)

##### getChildToParentEvents()

```ts
static getChildToParentEvents(
   childProvider: Provider,
   filter: object,
   position?: BigNumber,
   destination?: string,
   hash?: BigNumber,
indexInBatch?: BigNumber): Promise<ChildToParentTransactionEvent & object[]>
```

Get event logs for ChildToParent transactions.

###### Parameters

| Parameter          | Type        | Description                                                                                                                                                                                                                                                                            |
| :----------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`    | `Provider`  |                                                                                                                                                                                                                                                                                        |
| `filter`           | `object`    | Block range filter                                                                                                                                                                                                                                                                     |
| `filter.fromBlock` | `BlockTag`  | -                                                                                                                                                                                                                                                                                      |
| `filter.toBlock`?  | `BlockTag`  | -                                                                                                                                                                                                                                                                                      |
| `position`?        | `BigNumber` | The batchnumber indexed field was removed in nitro and a position indexed field was added.<br />For pre-nitro events the value passed in here will be used to find events with the same batchnumber.<br />For post nitro events it will be used to find events with the same position. |
| `destination`?     | `string`    | The parent destination of the ChildToParent message                                                                                                                                                                                                                                    |
| `hash`?            | `BigNumber` | The uniqueId indexed field was removed in nitro and a hash indexed field was added.<br />For pre-nitro events the value passed in here will be used to find events with the same uniqueId.<br />For post nitro events it will be used to find events with the same hash.               |
| `indexInBatch`?    | `BigNumber` | The index in the batch, only valid for pre-nitro events. This parameter is ignored post-nitro                                                                                                                                                                                          |

###### Returns

`Promise`\<`ChildToParentTransactionEvent` & `object`[]\>

Any classic and nitro events that match the provided filters.

###### Inherited from

[`ChildToParentMessage`](ChildToParentMessage.md#childtoparentmessage) . [`getChildToParentEvents`](ChildToParentMessage.md#getchildtoparentevents)

###### Source

[message/ChildToParentMessage.ts:109](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L109)

---

### ChildToParentMessageWriter

Provides read and write access for Child-to-Parent messages

#### Extends

- [`ChildToParentMessageReader`](ChildToParentMessage.md#childtoparentmessagereader)

#### Constructors

##### new ChildToParentMessageWriter()

```ts
new ChildToParentMessageWriter(
   parentSigner: Signer,
   event: ChildToParentTransactionEvent,
   parentProvider?: Provider): ChildToParentMessageWriter
```

Instantiates a new `ChildToParentMessageWriter` object.

###### Parameters

| Parameter         | Type                            | Description                                                                                                                                                                    |
| :---------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSigner`    | `Signer`                        | The signer to be used for executing the Child-to-Parent message.                                                                                                               |
| `event`           | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                  |
| `parentProvider`? | `Provider`                      | Optional. Used to override the Provider which is attached to `parentSigner` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageWriter`](ChildToParentMessage.md#childtoparentmessagewriter)

###### Overrides

`ChildToParentMessageReader.constructor`

###### Source

[message/ChildToParentMessage.ts:296](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L296)

#### Methods

##### execute()

```ts
execute(childProvider: Provider, overrides?: Overrides): Promise<ContractTransaction>
```

Executes the ChildToParentMessage on Parent chain.
Will throw an error if the outbox entry has not been created, which happens when the
corresponding assertion is confirmed.

###### Parameters

| Parameter       | Type        |
| :-------------- | :---------- |
| `childProvider` | `Provider`  |
| `overrides`?    | `Overrides` |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Source

[message/ChildToParentMessage.ts:325](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L325)

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<null | BigNumber>
```

Estimates the Parent block number in which this Child-to-Parent tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

expected Parent block number where the Child-to-Parent message will be executable. Returns null if the message can or already has been executed

###### Inherited from

[`ChildToParentMessageReader`](ChildToParentMessage.md#childtoparentmessagereader) . [`getFirstExecutableBlock`](ChildToParentMessage.md#getfirstexecutableblock)

###### Source

[message/ChildToParentMessage.ts:273](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L273)

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>
```

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       |
| :-------------- | :--------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

###### Inherited from

[`ChildToParentMessageReader`](ChildToParentMessage.md#childtoparentmessagereader) . [`status`](ChildToParentMessage.md#status)

###### Source

[message/ChildToParentMessage.ts:237](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L237)

##### waitUntilReadyToExecute()

```ts
waitUntilReadyToExecute(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
```

Waits until the outbox entry has been created, and will not return until it has been.
WARNING: Outbox entries are only created when the corresponding node is confirmed. Which
can take 1 week+, so waiting here could be a very long operation.

###### Parameters

| Parameter       | Type       | Default value | Description |
| :-------------- | :--------- | :------------ | :---------- |
| `childProvider` | `Provider` | `undefined`   | -           |
| `retryDelay`    | `number`   | `500`         |             |

###### Returns

`Promise`\<`CONFIRMED` \| `EXECUTED`\>

outbox entry status (either executed or confirmed but not pending)

###### Inherited from

[`ChildToParentMessageReader`](ChildToParentMessage.md#childtoparentmessagereader) . [`waitUntilReadyToExecute`](ChildToParentMessage.md#waituntilreadytoexecute)

###### Source

[message/ChildToParentMessage.ts:252](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L252)

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: ChildToParentTransactionEvent,
parentProvider?: Provider): ChildToParentMessageReaderOrWriter<T>
```

Instantiates a new `ChildToParentMessageWriter` or `ChildToParentMessageReader` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                            | Description                                                                                                                                                                              |
| :----------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                             | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `parentProvider`?        | `Provider`                      | Optional. Used to override the Provider which is attached to `ParentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriter`](ChildToParentMessage.md#childtoparentmessagereaderorwritert)\<`T`\>

###### Inherited from

[`ChildToParentMessageReader`](ChildToParentMessage.md#childtoparentmessagereader) . [`fromEvent`](ChildToParentMessage.md#fromevent-1)

###### Source

[message/ChildToParentMessage.ts:76](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L76)

##### getChildToParentEvents()

```ts
static getChildToParentEvents(
   childProvider: Provider,
   filter: object,
   position?: BigNumber,
   destination?: string,
   hash?: BigNumber,
indexInBatch?: BigNumber): Promise<ChildToParentTransactionEvent & object[]>
```

Get event logs for ChildToParent transactions.

###### Parameters

| Parameter          | Type        | Description                                                                                                                                                                                                                                                                            |
| :----------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`    | `Provider`  |                                                                                                                                                                                                                                                                                        |
| `filter`           | `object`    | Block range filter                                                                                                                                                                                                                                                                     |
| `filter.fromBlock` | `BlockTag`  | -                                                                                                                                                                                                                                                                                      |
| `filter.toBlock`?  | `BlockTag`  | -                                                                                                                                                                                                                                                                                      |
| `position`?        | `BigNumber` | The batchnumber indexed field was removed in nitro and a position indexed field was added.<br />For pre-nitro events the value passed in here will be used to find events with the same batchnumber.<br />For post nitro events it will be used to find events with the same position. |
| `destination`?     | `string`    | The parent destination of the ChildToParent message                                                                                                                                                                                                                                    |
| `hash`?            | `BigNumber` | The uniqueId indexed field was removed in nitro and a hash indexed field was added.<br />For pre-nitro events the value passed in here will be used to find events with the same uniqueId.<br />For post nitro events it will be used to find events with the same hash.               |
| `indexInBatch`?    | `BigNumber` | The index in the batch, only valid for pre-nitro events. This parameter is ignored post-nitro                                                                                                                                                                                          |

###### Returns

`Promise`\<`ChildToParentTransactionEvent` & `object`[]\>

Any classic and nitro events that match the provided filters.

###### Inherited from

[`ChildToParentMessageReader`](ChildToParentMessage.md#childtoparentmessagereader) . [`getChildToParentEvents`](ChildToParentMessage.md#getchildtoparentevents-1)

###### Source

[message/ChildToParentMessage.ts:109](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L109)

## Type Aliases

### ChildToParentMessageReaderOrWriter\<T\>

```ts
type ChildToParentMessageReaderOrWriter<T>: T extends Provider ? ChildToParentMessageReader : ChildToParentMessageWriter;
```

Conditional type for Signer or Provider. If T is of type Provider
then ChildToParentMessageReaderOrWriter\<T\> will be of type ChildToParentMessageReader.
If T is of type Signer then ChildToParentMessageReaderOrWriter\<T\> will be of
type ChildToParentMessageWriter.

#### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

#### Source

[message/ChildToParentMessage.ts:54](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L54)
