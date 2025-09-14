---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ChildToParentMessageNitro

Base functionality for nitro Child->Parent messages

#### Extended by

- [`ChildToParentMessageReaderNitro`](ChildToParentMessageNitro.md#childtoparentmessagereadernitro)

#### Methods

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: object,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterNitro<T>
```

Instantiates a new `ChildToParentMessageWriterNitro` or `ChildToParentMessageReaderNitro` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                                                                              |
| :----------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `object`    | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `event.arbBlockNum`      | `BigNumber` | -                                                                                                                                                                                        |
| `event.caller`?          | `string`    | -                                                                                                                                                                                        |
| `event.callvalue`?       | `BigNumber` | -                                                                                                                                                                                        |
| `event.data`?            | `string`    | -                                                                                                                                                                                        |
| `event.destination`?     | `string`    | -                                                                                                                                                                                        |
| `event.ethBlockNum`?     | `BigNumber` | -                                                                                                                                                                                        |
| `event.hash`?            | `BigNumber` | -                                                                                                                                                                                        |
| `event.position`?        | `BigNumber` | -                                                                                                                                                                                        |
| `event.timestamp`?       | `BigNumber` | -                                                                                                                                                                                        |
| `parentProvider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterNitro`](ChildToParentMessageNitro.md#childtoparentmessagereaderorwriternitrot)\<`T`\>

###### Source

[message/ChildToParentMessageNitro.ts:148](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L148)

---

### ChildToParentMessageReaderNitro

Provides read-only access nitro for child-to-parent-messages

#### Extends

- [`ChildToParentMessageNitro`](ChildToParentMessageNitro.md#childtoparentmessagenitro)

#### Extended by

- [`ChildToParentMessageWriterNitro`](ChildToParentMessageNitro.md#childtoparentmessagewriternitro)

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<null | BigNumber>
```

Estimates the L1 block number in which this L2 to L1 tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

expected parent chain block number where the child chain to parent chain message will be executable. Returns null if the message can be or already has been executed

###### Source

[message/ChildToParentMessageNitro.ts:596](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L596)

##### getRollupAndUpdateNetwork()

```ts
private getRollupAndUpdateNetwork(arbitrumNetwork: ArbitrumNetwork): Promise<RollupUserLogic | BoldRollupUserLogic>
```

If the local network is not currently bold, checks if the remote network is bold
and if so updates the local network with a new rollup address

###### Parameters

| Parameter         | Type                                                             | Description |
| :---------------- | :--------------------------------------------------------------- | :---------- |
| `arbitrumNetwork` | [`ArbitrumNetwork`](../dataEntities/networks.md#arbitrumnetwork) |             |

###### Returns

`Promise`\<`RollupUserLogic` \| `BoldRollupUserLogic`\>

The rollup contract, bold or legacy

###### Source

[message/ChildToParentMessageNitro.ts:567](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L567)

##### hasExecuted()

```ts
protected hasExecuted(childProvider: Provider): Promise<boolean>
```

Check if this message has already been executed in the Outbox

###### Parameters

| Parameter       | Type       |
| :-------------- | :--------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Source

[message/ChildToParentMessageNitro.ts:225](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L225)

##### isBold()

```ts
private isBold(arbitrumNetwork: ArbitrumNetwork, parentProvider: Provider): Promise<undefined | string>
```

Check whether the provided network has a BoLD rollup

###### Parameters

| Parameter         | Type                                                             | Description |
| :---------------- | :--------------------------------------------------------------- | :---------- |
| `arbitrumNetwork` | [`ArbitrumNetwork`](../dataEntities/networks.md#arbitrumnetwork) |             |
| `parentProvider`  | `Provider`                                                       |             |

###### Returns

`Promise`\<`undefined` \| `string`\>

###### Source

[message/ChildToParentMessageNitro.ts:531](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L531)

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

[message/ChildToParentMessageNitro.ts:240](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L240)

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

[message/ChildToParentMessageNitro.ts:507](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L507)

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: object,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterNitro<T>
```

Instantiates a new `ChildToParentMessageWriterNitro` or `ChildToParentMessageReaderNitro` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                                                                              |
| :----------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `object`    | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `event.arbBlockNum`      | `BigNumber` | -                                                                                                                                                                                        |
| `event.caller`?          | `string`    | -                                                                                                                                                                                        |
| `event.callvalue`?       | `BigNumber` | -                                                                                                                                                                                        |
| `event.data`?            | `string`    | -                                                                                                                                                                                        |
| `event.destination`?     | `string`    | -                                                                                                                                                                                        |
| `event.ethBlockNum`?     | `BigNumber` | -                                                                                                                                                                                        |
| `event.hash`?            | `BigNumber` | -                                                                                                                                                                                        |
| `event.position`?        | `BigNumber` | -                                                                                                                                                                                        |
| `event.timestamp`?       | `BigNumber` | -                                                                                                                                                                                        |
| `parentProvider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterNitro`](ChildToParentMessageNitro.md#childtoparentmessagereaderorwriternitrot)\<`T`\>

###### Inherited from

[`ChildToParentMessageNitro`](ChildToParentMessageNitro.md#childtoparentmessagenitro) . [`fromEvent`](ChildToParentMessageNitro.md#fromevent)

###### Source

[message/ChildToParentMessageNitro.ts:148](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L148)

---

### ChildToParentMessageWriterNitro

Provides read and write access for nitro child-to-Parent-messages

#### Extends

- [`ChildToParentMessageReaderNitro`](ChildToParentMessageNitro.md#childtoparentmessagereadernitro)

#### Constructors

##### new ChildToParentMessageWriterNitro()

```ts
new ChildToParentMessageWriterNitro(
   parentSigner: Signer,
   event: object,
   parentProvider?: Provider): ChildToParentMessageWriterNitro
```

Instantiates a new `ChildToParentMessageWriterNitro` object.

###### Parameters

| Parameter            | Type        | Description                                                                                                                                                                    |
| :------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSigner`       | `Signer`    | The signer to be used for executing the Child-to-Parent message.                                                                                                               |
| `event`              | `object`    | The event containing the data of the Child-to-Parent message.                                                                                                                  |
| `event.arbBlockNum`  | `BigNumber` | -                                                                                                                                                                              |
| `event.caller`?      | `string`    | -                                                                                                                                                                              |
| `event.callvalue`?   | `BigNumber` | -                                                                                                                                                                              |
| `event.data`?        | `string`    | -                                                                                                                                                                              |
| `event.destination`? | `string`    | -                                                                                                                                                                              |
| `event.ethBlockNum`? | `BigNumber` | -                                                                                                                                                                              |
| `event.hash`?        | `BigNumber` | -                                                                                                                                                                              |
| `event.position`?    | `BigNumber` | -                                                                                                                                                                              |
| `event.timestamp`?   | `BigNumber` | -                                                                                                                                                                              |
| `parentProvider`?    | `Provider`  | Optional. Used to override the Provider which is attached to `parentSigner` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageWriterNitro`](ChildToParentMessageNitro.md#childtoparentmessagewriternitro)

###### Overrides

`ChildToParentMessageReaderNitro.constructor`

###### Source

[message/ChildToParentMessageNitro.ts:724](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L724)

#### Properties

| Property       | Modifier  | Type     | Description                                                      |
| :------------- | :-------- | :------- | :--------------------------------------------------------------- |
| `parentSigner` | `private` | `Signer` | The signer to be used for executing the Child-to-Parent message. |

#### Methods

##### execute()

```ts
execute(childProvider: Provider, overrides?: Overrides): Promise<ContractTransaction>
```

Executes the ChildToParentMessage on Parent Chain.
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

[message/ChildToParentMessageNitro.ts:738](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L738)

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<null | BigNumber>
```

Estimates the L1 block number in which this L2 to L1 tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

expected parent chain block number where the child chain to parent chain message will be executable. Returns null if the message can be or already has been executed

###### Inherited from

[`ChildToParentMessageReaderNitro`](ChildToParentMessageNitro.md#childtoparentmessagereadernitro) . [`getFirstExecutableBlock`](ChildToParentMessageNitro.md#getfirstexecutableblock)

###### Source

[message/ChildToParentMessageNitro.ts:596](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L596)

##### hasExecuted()

```ts
protected hasExecuted(childProvider: Provider): Promise<boolean>
```

Check if this message has already been executed in the Outbox

###### Parameters

| Parameter       | Type       |
| :-------------- | :--------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`ChildToParentMessageReaderNitro`](ChildToParentMessageNitro.md#childtoparentmessagereadernitro) . [`hasExecuted`](ChildToParentMessageNitro.md#hasexecuted)

###### Source

[message/ChildToParentMessageNitro.ts:225](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L225)

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

[`ChildToParentMessageReaderNitro`](ChildToParentMessageNitro.md#childtoparentmessagereadernitro) . [`status`](ChildToParentMessageNitro.md#status)

###### Source

[message/ChildToParentMessageNitro.ts:240](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L240)

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

[`ChildToParentMessageReaderNitro`](ChildToParentMessageNitro.md#childtoparentmessagereadernitro) . [`waitUntilReadyToExecute`](ChildToParentMessageNitro.md#waituntilreadytoexecute)

###### Source

[message/ChildToParentMessageNitro.ts:507](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L507)

##### fromEvent()

```ts
static fromEvent<T>(
   parentSignerOrProvider: T,
   event: object,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterNitro<T>
```

Instantiates a new `ChildToParentMessageWriterNitro` or `ChildToParentMessageReaderNitro` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                                                                              |
| :----------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `event`                  | `object`    | The event containing the data of the Child-to-Parent message.                                                                                                                            |
| `event.arbBlockNum`      | `BigNumber` | -                                                                                                                                                                                        |
| `event.caller`?          | `string`    | -                                                                                                                                                                                        |
| `event.callvalue`?       | `BigNumber` | -                                                                                                                                                                                        |
| `event.data`?            | `string`    | -                                                                                                                                                                                        |
| `event.destination`?     | `string`    | -                                                                                                                                                                                        |
| `event.ethBlockNum`?     | `BigNumber` | -                                                                                                                                                                                        |
| `event.hash`?            | `BigNumber` | -                                                                                                                                                                                        |
| `event.position`?        | `BigNumber` | -                                                                                                                                                                                        |
| `event.timestamp`?       | `BigNumber` | -                                                                                                                                                                                        |
| `parentProvider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterNitro`](ChildToParentMessageNitro.md#childtoparentmessagereaderorwriternitrot)\<`T`\>

###### Inherited from

[`ChildToParentMessageReaderNitro`](ChildToParentMessageNitro.md#childtoparentmessagereadernitro) . [`fromEvent`](ChildToParentMessageNitro.md#fromevent-1)

###### Source

[message/ChildToParentMessageNitro.ts:148](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L148)

## Type Aliases

### ChildToParentMessageReaderOrWriterNitro\<T\>

```ts
type ChildToParentMessageReaderOrWriterNitro<T>: T extends Provider ? ChildToParentMessageReaderNitro : ChildToParentMessageWriterNitro;
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

[message/ChildToParentMessageNitro.ts:64](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageNitro.ts#L64)
