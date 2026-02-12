---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ChildToParentMessageNitro

Defined in: [message/ChildToParentMessageNitro.ts:136](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L136)

Base functionality for nitro Child-\>Parent messages

#### Extended by

- [`ChildToParentMessageReaderNitro`](#childtoparentmessagereadernitro)

#### Methods

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: object,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterNitro<T>;
```

Defined in: [message/ChildToParentMessageNitro.ts:148](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L148)

Instantiates a new `ChildToParentMessageWriterNitro` or `ChildToParentMessageReaderNitro` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                                                                                                                                                                                                                           | Description                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                                                                                                                                                                                                                            | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | \{ `arbBlockNum`: `BigNumber`; `caller`: `string`; `callvalue`: `BigNumber`; `data`: `string`; `destination`: `string`; `ethBlockNum`: `BigNumber`; `hash`: `BigNumber`; `position`: `BigNumber`; `timestamp`: `BigNumber`; \} | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `event.arbBlockNum`      | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.caller?`          | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.callvalue?`       | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.data?`            | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.destination?`     | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.ethBlockNum?`     | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.hash?`            | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.position?`        | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.timestamp?`       | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `parentProvider?`        | `Provider`                                                                                                                                                                                                                     | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterNitro`](#childtoparentmessagereaderorwriternitro)\<`T`\>

---

### ChildToParentMessageReaderNitro

Defined in: [message/ChildToParentMessageNitro.ts:190](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L190)

Provides read-only access nitro for child-to-parent-messages

#### Extends

- [`ChildToParentMessageNitro`](#childtoparentmessagenitro)

#### Extended by

- [`ChildToParentMessageWriterNitro`](#childtoparentmessagewriternitro)

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<BigNumber | null>;
```

Defined in: [message/ChildToParentMessageNitro.ts:596](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L596)

Estimates the L1 block number in which this L2 to L1 tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`BigNumber` \| `null`\>

expected parent chain block number where the child chain to parent chain message will be executable. Returns null if the message can be or already has been executed

##### hasExecuted()

```ts
protected hasExecuted(childProvider: Provider): Promise<boolean>;
```

Defined in: [message/ChildToParentMessageNitro.ts:225](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L225)

Check if this message has already been executed in the Outbox

###### Parameters

| Parameter       | Type       |
| --------------- | ---------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>;
```

Defined in: [message/ChildToParentMessageNitro.ts:240](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L240)

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

Defined in: [message/ChildToParentMessageNitro.ts:507](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L507)

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
   event: object,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterNitro<T>;
```

Defined in: [message/ChildToParentMessageNitro.ts:148](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L148)

Instantiates a new `ChildToParentMessageWriterNitro` or `ChildToParentMessageReaderNitro` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                                                                                                                                                                                                                           | Description                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                                                                                                                                                                                                                            | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | \{ `arbBlockNum`: `BigNumber`; `caller`: `string`; `callvalue`: `BigNumber`; `data`: `string`; `destination`: `string`; `ethBlockNum`: `BigNumber`; `hash`: `BigNumber`; `position`: `BigNumber`; `timestamp`: `BigNumber`; \} | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `event.arbBlockNum`      | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.caller?`          | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.callvalue?`       | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.data?`            | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.destination?`     | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.ethBlockNum?`     | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.hash?`            | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.position?`        | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.timestamp?`       | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `parentProvider?`        | `Provider`                                                                                                                                                                                                                     | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterNitro`](#childtoparentmessagereaderorwriternitro)\<`T`\>

###### Inherited from

[`ChildToParentMessageNitro`](#childtoparentmessagenitro).[`fromEvent`](#fromevent)

---

### ChildToParentMessageWriterNitro

Defined in: [message/ChildToParentMessageNitro.ts:716](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L716)

Provides read and write access for nitro child-to-Parent-messages

#### Extends

- [`ChildToParentMessageReaderNitro`](#childtoparentmessagereadernitro)

#### Constructors

##### Constructor

```ts
new ChildToParentMessageWriterNitro(
   parentSigner: Signer,
   event: object,
   parentProvider?: Provider): ChildToParentMessageWriterNitro;
```

Defined in: [message/ChildToParentMessageNitro.ts:724](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L724)

Instantiates a new `ChildToParentMessageWriterNitro` object.

###### Parameters

| Parameter            | Type                                                                                                                                                                                                                           | Description                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `parentSigner`       | `Signer`                                                                                                                                                                                                                       | The signer to be used for executing the Child-to-Parent message.                                                                                                               |
| `event`              | \{ `arbBlockNum`: `BigNumber`; `caller`: `string`; `callvalue`: `BigNumber`; `data`: `string`; `destination`: `string`; `ethBlockNum`: `BigNumber`; `hash`: `BigNumber`; `position`: `BigNumber`; `timestamp`: `BigNumber`; \} | The event containing the data of the Child-to-Parent message.                                                                                                                  |
| `event.arbBlockNum`  | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                              |
| `event.caller?`      | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                              |
| `event.callvalue?`   | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                              |
| `event.data?`        | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                              |
| `event.destination?` | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                              |
| `event.ethBlockNum?` | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                              |
| `event.hash?`        | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                              |
| `event.position?`    | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                              |
| `event.timestamp?`   | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                              |
| `parentProvider?`    | `Provider`                                                                                                                                                                                                                     | Optional. Used to override the Provider which is attached to `parentSigner` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageWriterNitro`](#childtoparentmessagewriternitro)

###### Overrides

```ts
ChildToParentMessageReaderNitro.constructor;
```

#### Methods

##### execute()

```ts
execute(childProvider: Provider, overrides?: Overrides): Promise<ContractTransaction>;
```

Defined in: [message/ChildToParentMessageNitro.ts:738](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L738)

Executes the ChildToParentMessage on Parent Chain.
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

Defined in: [message/ChildToParentMessageNitro.ts:596](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L596)

Estimates the L1 block number in which this L2 to L1 tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`BigNumber` \| `null`\>

expected parent chain block number where the child chain to parent chain message will be executable. Returns null if the message can be or already has been executed

###### Inherited from

[`ChildToParentMessageReaderNitro`](#childtoparentmessagereadernitro).[`getFirstExecutableBlock`](#getfirstexecutableblock)

##### hasExecuted()

```ts
protected hasExecuted(childProvider: Provider): Promise<boolean>;
```

Defined in: [message/ChildToParentMessageNitro.ts:225](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L225)

Check if this message has already been executed in the Outbox

###### Parameters

| Parameter       | Type       |
| --------------- | ---------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`ChildToParentMessageReaderNitro`](#childtoparentmessagereadernitro).[`hasExecuted`](#hasexecuted)

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>;
```

Defined in: [message/ChildToParentMessageNitro.ts:240](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L240)

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       |
| --------------- | ---------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

###### Inherited from

[`ChildToParentMessageReaderNitro`](#childtoparentmessagereadernitro).[`status`](#status)

##### waitUntilReadyToExecute()

```ts
waitUntilReadyToExecute(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>;
```

Defined in: [message/ChildToParentMessageNitro.ts:507](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L507)

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

[`ChildToParentMessageReaderNitro`](#childtoparentmessagereadernitro).[`waitUntilReadyToExecute`](#waituntilreadytoexecute)

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: object,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterNitro<T>;
```

Defined in: [message/ChildToParentMessageNitro.ts:148](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L148)

Instantiates a new `ChildToParentMessageWriterNitro` or `ChildToParentMessageReaderNitro` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type                                                                                                                                                                                                                           | Description                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`                                                                                                                                                                                                                            | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | \{ `arbBlockNum`: `BigNumber`; `caller`: `string`; `callvalue`: `BigNumber`; `data`: `string`; `destination`: `string`; `ethBlockNum`: `BigNumber`; `hash`: `BigNumber`; `position`: `BigNumber`; `timestamp`: `BigNumber`; \} | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `event.arbBlockNum`      | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.caller?`          | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.callvalue?`       | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.data?`            | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.destination?`     | `string`                                                                                                                                                                                                                       | -                                                                                                                                                                                        |
| `event.ethBlockNum?`     | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.hash?`            | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.position?`        | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `event.timestamp?`       | `BigNumber`                                                                                                                                                                                                                    | -                                                                                                                                                                                        |
| `parentProvider?`        | `Provider`                                                                                                                                                                                                                     | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterNitro`](#childtoparentmessagereaderorwriternitro)\<`T`\>

###### Inherited from

[`ChildToParentMessageReaderNitro`](#childtoparentmessagereadernitro).[`fromEvent`](#fromevent-2)

## Type Aliases

### ChildToParentMessageReaderOrWriterNitro

```ts
type ChildToParentMessageReaderOrWriterNitro<T> = T extends Provider
  ? ChildToParentMessageReaderNitro
  : ChildToParentMessageWriterNitro;
```

Defined in: [message/ChildToParentMessageNitro.ts:64](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L64)

Conditional type for Signer or Provider. If T is of type Provider
then ChildToParentMessageReaderOrWriter\<T\> will be of type ChildToParentMessageReader.
If T is of type Signer then ChildToParentMessageReaderOrWriter\<T\> will be of
type ChildToParentMessageWriter.

#### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |
