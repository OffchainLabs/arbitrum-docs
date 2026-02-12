---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ChildToParentMessage

Defined in: [message/ChildToParentMessage.ts:60](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L60)

Base functionality for Child-to-Parent messages

#### Extended by

- [`ChildToParentMessageReader`](#childtoparentmessagereader)

#### Methods

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: ChildToParentTransactionEvent,
parentProvider?: Provider): ChildToParentMessageReaderOrWriter<T>;
```

Defined in: [message/ChildToParentMessage.ts:76](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L76)

Instantiates a new `ChildToParentMessageWriter` or `ChildToParentMessageReader` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                            | Description                                                                                                                                                                              |
| ------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                             | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `parentProvider?`        | `Provider`                      | Optional. Used to override the Provider which is attached to `ParentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriter`](#childtoparentmessagereaderorwriter)\<`T`\>

##### getChildToParentEvents()

```ts
static getChildToParentEvents(
   childProvider: Provider,
   filter: object,
   position?: BigNumber,
   destination?: string,
   hash?: BigNumber,
indexInBatch?: BigNumber): Promise<ChildToParentTransactionEvent & object[]>;
```

Defined in: [message/ChildToParentMessage.ts:109](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L109)

Get event logs for ChildToParent transactions.

###### Parameters

| Parameter          | Type                                                  | Description                                                                                                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`    | `Provider`                                            |                                                                                                                                                                                                                                                                              |
| `filter`           | \{ `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \} | Block range filter                                                                                                                                                                                                                                                           |
| `filter.fromBlock` | `BlockTag`                                            | -                                                                                                                                                                                                                                                                            |
| `filter.toBlock?`  | `BlockTag`                                            | -                                                                                                                                                                                                                                                                            |
| `position?`        | `BigNumber`                                           | The batchnumber indexed field was removed in nitro and a position indexed field was added. For pre-nitro events the value passed in here will be used to find events with the same batchnumber. For post nitro events it will be used to find events with the same position. |
| `destination?`     | `string`                                              | The parent destination of the ChildToParent message                                                                                                                                                                                                                          |
| `hash?`            | `BigNumber`                                           | The uniqueId indexed field was removed in nitro and a hash indexed field was added. For pre-nitro events the value passed in here will be used to find events with the same uniqueId. For post nitro events it will be used to find events with the same hash.               |
| `indexInBatch?`    | `BigNumber`                                           | The index in the batch, only valid for pre-nitro events. This parameter is ignored post-nitro                                                                                                                                                                                |

###### Returns

`Promise`\<`ChildToParentTransactionEvent` & `object`[]\>

Any classic and nitro events that match the provided filters.

---

### ChildToParentMessageReader

Defined in: [message/ChildToParentMessage.ts:201](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L201)

Provides read-only access for Child-to-Parent messages

#### Extends

- [`ChildToParentMessage`](#childtoparentmessage)

#### Extended by

- [`ChildToParentMessageWriter`](#childtoparentmessagewriter)

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<BigNumber | null>;
```

Defined in: [message/ChildToParentMessage.ts:273](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L273)

Estimates the Parent block number in which this Child-to-Parent tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`BigNumber` \| `null`\>

expected Parent block number where the Child-to-Parent message will be executable. Returns null if the message can or already has been executed

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>;
```

Defined in: [message/ChildToParentMessage.ts:237](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L237)

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       |
| --------------- | ---------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

##### waitUntilReadyToExecute()

```ts
waitUntilReadyToExecute(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>;
```

Defined in: [message/ChildToParentMessage.ts:252](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L252)

Waits until the outbox entry has been created, and will not return until it has been.
WARNING: Outbox entries are only created when the corresponding node is confirmed. Which
can take 1 week+, so waiting here could be a very long operation.

###### Parameters

| Parameter       | Type       | Default value | Description |
| --------------- | ---------- | ------------- | ----------- |
| `childProvider` | `Provider` | `undefined`   | -           |
| `retryDelay`    | `number`   | `500`         |             |

###### Returns

`Promise`\<`CONFIRMED` \| `EXECUTED`\>

outbox entry status (either executed or confirmed but not pending)

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: ChildToParentTransactionEvent,
parentProvider?: Provider): ChildToParentMessageReaderOrWriter<T>;
```

Defined in: [message/ChildToParentMessage.ts:76](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L76)

Instantiates a new `ChildToParentMessageWriter` or `ChildToParentMessageReader` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                            | Description                                                                                                                                                                              |
| ------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                             | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `parentProvider?`        | `Provider`                      | Optional. Used to override the Provider which is attached to `ParentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriter`](#childtoparentmessagereaderorwriter)\<`T`\>

###### Inherited from

[`ChildToParentMessage`](#childtoparentmessage).[`fromEvent`](#fromevent)

##### getChildToParentEvents()

```ts
static getChildToParentEvents(
   childProvider: Provider,
   filter: object,
   position?: BigNumber,
   destination?: string,
   hash?: BigNumber,
indexInBatch?: BigNumber): Promise<ChildToParentTransactionEvent & object[]>;
```

Defined in: [message/ChildToParentMessage.ts:109](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L109)

Get event logs for ChildToParent transactions.

###### Parameters

| Parameter          | Type                                                  | Description                                                                                                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`    | `Provider`                                            |                                                                                                                                                                                                                                                                              |
| `filter`           | \{ `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \} | Block range filter                                                                                                                                                                                                                                                           |
| `filter.fromBlock` | `BlockTag`                                            | -                                                                                                                                                                                                                                                                            |
| `filter.toBlock?`  | `BlockTag`                                            | -                                                                                                                                                                                                                                                                            |
| `position?`        | `BigNumber`                                           | The batchnumber indexed field was removed in nitro and a position indexed field was added. For pre-nitro events the value passed in here will be used to find events with the same batchnumber. For post nitro events it will be used to find events with the same position. |
| `destination?`     | `string`                                              | The parent destination of the ChildToParent message                                                                                                                                                                                                                          |
| `hash?`            | `BigNumber`                                           | The uniqueId indexed field was removed in nitro and a hash indexed field was added. For pre-nitro events the value passed in here will be used to find events with the same uniqueId. For post nitro events it will be used to find events with the same hash.               |
| `indexInBatch?`    | `BigNumber`                                           | The index in the batch, only valid for pre-nitro events. This parameter is ignored post-nitro                                                                                                                                                                                |

###### Returns

`Promise`\<`ChildToParentTransactionEvent` & `object`[]\>

Any classic and nitro events that match the provided filters.

###### Inherited from

[`ChildToParentMessage`](#childtoparentmessage).[`getChildToParentEvents`](#getchildtoparentevents)

---

### ChildToParentMessageWriter

Defined in: [message/ChildToParentMessage.ts:285](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L285)

Provides read and write access for Child-to-Parent messages

#### Extends

- [`ChildToParentMessageReader`](#childtoparentmessagereader)

#### Constructors

##### Constructor

```ts
new ChildToParentMessageWriter(
   parentSigner: Signer,
   event: ChildToParentTransactionEvent,
   parentProvider?: Provider): ChildToParentMessageWriter;
```

Defined in: [message/ChildToParentMessage.ts:296](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L296)

Instantiates a new `ChildToParentMessageWriter` object.

###### Parameters

| Parameter         | Type                            | Description                                                                                                                                                                    |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `parentSigner`    | `Signer`                        | The signer to be used for executing the Child-to-Parent message.                                                                                                               |
| `event`           | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                  |
| `parentProvider?` | `Provider`                      | Optional. Used to override the Provider which is attached to `parentSigner` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageWriter`](#childtoparentmessagewriter)

###### Overrides

```ts
ChildToParentMessageReader.constructor;
```

#### Methods

##### execute()

```ts
execute(childProvider: Provider, overrides?: Overrides): Promise<ContractTransaction>;
```

Defined in: [message/ChildToParentMessage.ts:325](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L325)

Executes the ChildToParentMessage on Parent chain.
Will throw an error if the outbox entry has not been created, which happens when the
corresponding assertion is confirmed.

###### Parameters

| Parameter       | Type        |
| --------------- | ----------- |
| `childProvider` | `Provider`  |
| `overrides?`    | `Overrides` |

###### Returns

`Promise`\<`ContractTransaction`\>

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<BigNumber | null>;
```

Defined in: [message/ChildToParentMessage.ts:273](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L273)

Estimates the Parent block number in which this Child-to-Parent tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`BigNumber` \| `null`\>

expected Parent block number where the Child-to-Parent message will be executable. Returns null if the message can or already has been executed

###### Inherited from

[`ChildToParentMessageReader`](#childtoparentmessagereader).[`getFirstExecutableBlock`](#getfirstexecutableblock)

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>;
```

Defined in: [message/ChildToParentMessage.ts:237](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L237)

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       |
| --------------- | ---------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

###### Inherited from

[`ChildToParentMessageReader`](#childtoparentmessagereader).[`status`](#status)

##### waitUntilReadyToExecute()

```ts
waitUntilReadyToExecute(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>;
```

Defined in: [message/ChildToParentMessage.ts:252](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L252)

Waits until the outbox entry has been created, and will not return until it has been.
WARNING: Outbox entries are only created when the corresponding node is confirmed. Which
can take 1 week+, so waiting here could be a very long operation.

###### Parameters

| Parameter       | Type       | Default value | Description |
| --------------- | ---------- | ------------- | ----------- |
| `childProvider` | `Provider` | `undefined`   | -           |
| `retryDelay`    | `number`   | `500`         |             |

###### Returns

`Promise`\<`CONFIRMED` \| `EXECUTED`\>

outbox entry status (either executed or confirmed but not pending)

###### Inherited from

[`ChildToParentMessageReader`](#childtoparentmessagereader).[`waitUntilReadyToExecute`](#waituntilreadytoexecute)

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: ChildToParentTransactionEvent,
parentProvider?: Provider): ChildToParentMessageReaderOrWriter<T>;
```

Defined in: [message/ChildToParentMessage.ts:76](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L76)

Instantiates a new `ChildToParentMessageWriter` or `ChildToParentMessageReader` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                            | Description                                                                                                                                                                              |
| ------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                             | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `ChildToParentTransactionEvent` | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `parentProvider?`        | `Provider`                      | Optional. Used to override the Provider which is attached to `ParentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriter`](#childtoparentmessagereaderorwriter)\<`T`\>

###### Inherited from

[`ChildToParentMessageReader`](#childtoparentmessagereader).[`fromEvent`](#fromevent-2)

##### getChildToParentEvents()

```ts
static getChildToParentEvents(
   childProvider: Provider,
   filter: object,
   position?: BigNumber,
   destination?: string,
   hash?: BigNumber,
indexInBatch?: BigNumber): Promise<ChildToParentTransactionEvent & object[]>;
```

Defined in: [message/ChildToParentMessage.ts:109](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L109)

Get event logs for ChildToParent transactions.

###### Parameters

| Parameter          | Type                                                  | Description                                                                                                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`    | `Provider`                                            |                                                                                                                                                                                                                                                                              |
| `filter`           | \{ `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \} | Block range filter                                                                                                                                                                                                                                                           |
| `filter.fromBlock` | `BlockTag`                                            | -                                                                                                                                                                                                                                                                            |
| `filter.toBlock?`  | `BlockTag`                                            | -                                                                                                                                                                                                                                                                            |
| `position?`        | `BigNumber`                                           | The batchnumber indexed field was removed in nitro and a position indexed field was added. For pre-nitro events the value passed in here will be used to find events with the same batchnumber. For post nitro events it will be used to find events with the same position. |
| `destination?`     | `string`                                              | The parent destination of the ChildToParent message                                                                                                                                                                                                                          |
| `hash?`            | `BigNumber`                                           | The uniqueId indexed field was removed in nitro and a hash indexed field was added. For pre-nitro events the value passed in here will be used to find events with the same uniqueId. For post nitro events it will be used to find events with the same hash.               |
| `indexInBatch?`    | `BigNumber`                                           | The index in the batch, only valid for pre-nitro events. This parameter is ignored post-nitro                                                                                                                                                                                |

###### Returns

`Promise`\<`ChildToParentTransactionEvent` & `object`[]\>

Any classic and nitro events that match the provided filters.

###### Inherited from

[`ChildToParentMessageReader`](#childtoparentmessagereader).[`getChildToParentEvents`](#getchildtoparentevents-2)

## Type Aliases

### ChildToParentMessageReaderOrWriter

```ts
type ChildToParentMessageReaderOrWriter<T> = T extends Provider
  ? ChildToParentMessageReader
  : ChildToParentMessageWriter;
```

Defined in: [message/ChildToParentMessage.ts:54](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessage.ts#L54)

Conditional type for Signer or Provider. If T is of type Provider
then ChildToParentMessageReaderOrWriter\<T\> will be of type ChildToParentMessageReader.
If T is of type Signer then ChildToParentMessageReaderOrWriter\<T\> will be of
type ChildToParentMessageWriter.

#### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |
