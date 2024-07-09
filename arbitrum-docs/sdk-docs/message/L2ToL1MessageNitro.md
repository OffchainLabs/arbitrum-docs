---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### L2ToL1MessageNitro

Base functionality for nitro L2->L1 messages

#### Extended by

- [`L2ToL1MessageReaderNitro`](L2ToL1MessageNitro.md#l2tol1messagereadernitro)

#### Methods

##### fromEvent()

```ts
static fromEvent<T>(
   l1SignerOrProvider: T,
   event: object,
l1Provider?: Provider): L2ToL1MessageReaderOrWriterNitro<T>
```

Instantiates a new `L2ToL1MessageWriterNitro` or `L2ToL1MessageReaderNitro` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type        | Description                                                                                                                                                                          |
| :------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1SignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the L2-to-L1 message.                                                                                                         |
| `event`              | `object`    | The event containing the data of the L2-to-L1 message.                                                                                                                               |
| `event.arbBlockNum`  | `BigNumber` | -                                                                                                                                                                                    |
| `event.caller`?      | `string`    | -                                                                                                                                                                                    |
| `event.callvalue`?   | `BigNumber` | -                                                                                                                                                                                    |
| `event.data`?        | `string`    | -                                                                                                                                                                                    |
| `event.destination`? | `string`    | -                                                                                                                                                                                    |
| `event.ethBlockNum`? | `BigNumber` | -                                                                                                                                                                                    |
| `event.hash`?        | `BigNumber` | -                                                                                                                                                                                    |
| `event.position`?    | `BigNumber` | -                                                                                                                                                                                    |
| `event.timestamp`?   | `BigNumber` | -                                                                                                                                                                                    |
| `l1Provider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `l1SignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`L2ToL1MessageReaderOrWriterNitro`](L2ToL1MessageNitro.md#l2tol1messagereaderorwriternitrot)\<`T`\>

###### Source

[message/L2ToL1MessageNitro.ts:136](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L136)

---

### L2ToL1MessageReaderNitro

Provides read-only access nitro for l2-to-l1-messages

#### Extends

- [`L2ToL1MessageNitro`](L2ToL1MessageNitro.md#l2tol1messagenitro)

#### Extended by

- [`L2ToL1MessageWriterNitro`](L2ToL1MessageNitro.md#l2tol1messagewriternitro)

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(l2Provider: Provider): Promise<null | BigNumber>
```

Estimates the L1 block number in which this L2 to L1 tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

expected L1 block number where the L2 to L1 message will be executable. Returns null if the message can be or already has been executed

###### Source

[message/L2ToL1MessageNitro.ts:434](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L434)

##### hasExecuted()

```ts
protected hasExecuted(l2Provider: Provider): Promise<boolean>
```

Check if this message has already been executed in the Outbox

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Source

[message/L2ToL1MessageNitro.ts:207](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L207)

##### status()

```ts
status(l2Provider: Provider): Promise<L2ToL1MessageStatus>
```

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise`\<`L2ToL1MessageStatus`\>

###### Source

[message/L2ToL1MessageNitro.ts:222](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L222)

##### waitUntilReadyToExecute()

```ts
waitUntilReadyToExecute(l2Provider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
```

Waits until the outbox entry has been created, and will not return until it has been.
WARNING: Outbox entries are only created when the corresponding node is confirmed. Which
can take 1 week+, so waiting here could be a very long operation.

###### Parameters

| Parameter    | Type       | Default value | Description |
| :----------- | :--------- | :------------ | :---------- |
| `l2Provider` | `Provider` | `undefined`   | -           |
| `retryDelay` | `number`   | `500`         |             |

###### Returns

`Promise`\<`CONFIRMED` \| `EXECUTED`\>

outbox entry status (either executed or confirmed but not pending)

###### Source

[message/L2ToL1MessageNitro.ts:412](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L412)

##### fromEvent()

```ts
static fromEvent<T>(
   l1SignerOrProvider: T,
   event: object,
l1Provider?: Provider): L2ToL1MessageReaderOrWriterNitro<T>
```

Instantiates a new `L2ToL1MessageWriterNitro` or `L2ToL1MessageReaderNitro` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type        | Description                                                                                                                                                                          |
| :------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1SignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the L2-to-L1 message.                                                                                                         |
| `event`              | `object`    | The event containing the data of the L2-to-L1 message.                                                                                                                               |
| `event.arbBlockNum`  | `BigNumber` | -                                                                                                                                                                                    |
| `event.caller`?      | `string`    | -                                                                                                                                                                                    |
| `event.callvalue`?   | `BigNumber` | -                                                                                                                                                                                    |
| `event.data`?        | `string`    | -                                                                                                                                                                                    |
| `event.destination`? | `string`    | -                                                                                                                                                                                    |
| `event.ethBlockNum`? | `BigNumber` | -                                                                                                                                                                                    |
| `event.hash`?        | `BigNumber` | -                                                                                                                                                                                    |
| `event.position`?    | `BigNumber` | -                                                                                                                                                                                    |
| `event.timestamp`?   | `BigNumber` | -                                                                                                                                                                                    |
| `l1Provider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `l1SignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`L2ToL1MessageReaderOrWriterNitro`](L2ToL1MessageNitro.md#l2tol1messagereaderorwriternitrot)\<`T`\>

###### Inherited from

[`L2ToL1MessageNitro`](L2ToL1MessageNitro.md#l2tol1messagenitro) . [`fromEvent`](L2ToL1MessageNitro.md#fromevent)

###### Source

[message/L2ToL1MessageNitro.ts:136](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L136)

---

### L2ToL1MessageWriterNitro

Provides read and write access for nitro l2-to-l1-messages

#### Extends

- [`L2ToL1MessageReaderNitro`](L2ToL1MessageNitro.md#l2tol1messagereadernitro)

#### Constructors

##### new L2ToL1MessageWriterNitro()

```ts
new L2ToL1MessageWriterNitro(
   l1Signer: Signer,
   event: object,
   l1Provider?: Provider): L2ToL1MessageWriterNitro
```

Instantiates a new `L2ToL1MessageWriterNitro` object.

###### Parameters

| Parameter            | Type        | Description                                                                                                                                                                |
| :------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1Signer`           | `Signer`    | The signer to be used for executing the L2-to-L1 message.                                                                                                                  |
| `event`              | `object`    | The event containing the data of the L2-to-L1 message.                                                                                                                     |
| `event.arbBlockNum`  | `BigNumber` | -                                                                                                                                                                          |
| `event.caller`?      | `string`    | -                                                                                                                                                                          |
| `event.callvalue`?   | `BigNumber` | -                                                                                                                                                                          |
| `event.data`?        | `string`    | -                                                                                                                                                                          |
| `event.destination`? | `string`    | -                                                                                                                                                                          |
| `event.ethBlockNum`? | `BigNumber` | -                                                                                                                                                                          |
| `event.hash`?        | `BigNumber` | -                                                                                                                                                                          |
| `event.position`?    | `BigNumber` | -                                                                                                                                                                          |
| `event.timestamp`?   | `BigNumber` | -                                                                                                                                                                          |
| `l1Provider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `l1Signer` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`L2ToL1MessageWriterNitro`](L2ToL1MessageNitro.md#l2tol1messagewriternitro)

###### Overrides

`L2ToL1MessageReaderNitro.constructor`

###### Source

[message/L2ToL1MessageNitro.ts:529](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L529)

#### Properties

| Property   | Modifier  | Type     | Description                                               |
| :--------- | :-------- | :------- | :-------------------------------------------------------- |
| `l1Signer` | `private` | `Signer` | The signer to be used for executing the L2-to-L1 message. |

#### Methods

##### execute()

```ts
execute(l2Provider: Provider, overrides?: Overrides): Promise<ContractTransaction>
```

Executes the L2ToL1Message on L1.
Will throw an error if the outbox entry has not been created, which happens when the
corresponding assertion is confirmed.

###### Parameters

| Parameter    | Type        |
| :----------- | :---------- |
| `l2Provider` | `Provider`  |
| `overrides`? | `Overrides` |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Source

[message/L2ToL1MessageNitro.ts:543](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L543)

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(l2Provider: Provider): Promise<null | BigNumber>
```

Estimates the L1 block number in which this L2 to L1 tx will be available for execution.
If the message can or already has been executed, this returns null

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

expected L1 block number where the L2 to L1 message will be executable. Returns null if the message can be or already has been executed

###### Inherited from

[`L2ToL1MessageReaderNitro`](L2ToL1MessageNitro.md#l2tol1messagereadernitro) . [`getFirstExecutableBlock`](L2ToL1MessageNitro.md#getfirstexecutableblock)

###### Source

[message/L2ToL1MessageNitro.ts:434](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L434)

##### hasExecuted()

```ts
protected hasExecuted(l2Provider: Provider): Promise<boolean>
```

Check if this message has already been executed in the Outbox

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`L2ToL1MessageReaderNitro`](L2ToL1MessageNitro.md#l2tol1messagereadernitro) . [`hasExecuted`](L2ToL1MessageNitro.md#hasexecuted)

###### Source

[message/L2ToL1MessageNitro.ts:207](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L207)

##### status()

```ts
status(l2Provider: Provider): Promise<L2ToL1MessageStatus>
```

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise`\<`L2ToL1MessageStatus`\>

###### Inherited from

[`L2ToL1MessageReaderNitro`](L2ToL1MessageNitro.md#l2tol1messagereadernitro) . [`status`](L2ToL1MessageNitro.md#status)

###### Source

[message/L2ToL1MessageNitro.ts:222](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L222)

##### waitUntilReadyToExecute()

```ts
waitUntilReadyToExecute(l2Provider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
```

Waits until the outbox entry has been created, and will not return until it has been.
WARNING: Outbox entries are only created when the corresponding node is confirmed. Which
can take 1 week+, so waiting here could be a very long operation.

###### Parameters

| Parameter    | Type       | Default value | Description |
| :----------- | :--------- | :------------ | :---------- |
| `l2Provider` | `Provider` | `undefined`   | -           |
| `retryDelay` | `number`   | `500`         |             |

###### Returns

`Promise`\<`CONFIRMED` \| `EXECUTED`\>

outbox entry status (either executed or confirmed but not pending)

###### Inherited from

[`L2ToL1MessageReaderNitro`](L2ToL1MessageNitro.md#l2tol1messagereadernitro) . [`waitUntilReadyToExecute`](L2ToL1MessageNitro.md#waituntilreadytoexecute)

###### Source

[message/L2ToL1MessageNitro.ts:412](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L412)

##### fromEvent()

```ts
static fromEvent<T>(
   l1SignerOrProvider: T,
   event: object,
l1Provider?: Provider): L2ToL1MessageReaderOrWriterNitro<T>
```

Instantiates a new `L2ToL1MessageWriterNitro` or `L2ToL1MessageReaderNitro` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type        | Description                                                                                                                                                                          |
| :------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1SignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the L2-to-L1 message.                                                                                                         |
| `event`              | `object`    | The event containing the data of the L2-to-L1 message.                                                                                                                               |
| `event.arbBlockNum`  | `BigNumber` | -                                                                                                                                                                                    |
| `event.caller`?      | `string`    | -                                                                                                                                                                                    |
| `event.callvalue`?   | `BigNumber` | -                                                                                                                                                                                    |
| `event.data`?        | `string`    | -                                                                                                                                                                                    |
| `event.destination`? | `string`    | -                                                                                                                                                                                    |
| `event.ethBlockNum`? | `BigNumber` | -                                                                                                                                                                                    |
| `event.hash`?        | `BigNumber` | -                                                                                                                                                                                    |
| `event.position`?    | `BigNumber` | -                                                                                                                                                                                    |
| `event.timestamp`?   | `BigNumber` | -                                                                                                                                                                                    |
| `l1Provider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `l1SignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`L2ToL1MessageReaderOrWriterNitro`](L2ToL1MessageNitro.md#l2tol1messagereaderorwriternitrot)\<`T`\>

###### Inherited from

[`L2ToL1MessageReaderNitro`](L2ToL1MessageNitro.md#l2tol1messagereadernitro) . [`fromEvent`](L2ToL1MessageNitro.md#fromevent-1)

###### Source

[message/L2ToL1MessageNitro.ts:136](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L136)

## Type Aliases

### L2ToL1MessageReaderOrWriterNitro\<T\>

```ts
type L2ToL1MessageReaderOrWriterNitro<T>: T extends Provider ? L2ToL1MessageReaderNitro : L2ToL1MessageWriterNitro;
```

Conditional type for Signer or Provider. If T is of type Provider
then L2ToL1MessageReaderOrWriter\<T\> will be of type L2ToL1MessageReader.
If T is of type Signer then L2ToL1MessageReaderOrWriter\<T\> will be of
type L2ToL1MessageWriter.

#### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

#### Source

[message/L2ToL1MessageNitro.ts:57](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageNitro.ts#L57)
