---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ChildToParentMessageReaderClassic

Provides read-only access for classic Child-to-Parent-messages

#### Extends

- `ChildToParentMessageClassic`

#### Extended by

- [`ChildToParentMessageWriterClassic`](ChildToParentMessageClassic.md#childtoparentmessagewriterclassic)

#### Properties

| Property        | Modifier    | Type               | Default value | Description                                                                                                             | Inherited from                             |
| :-------------- | :---------- | :----------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| `batchNumber`   | `readonly`  | `BigNumber`        | `undefined`   | The number of the batch this message is part of                                                                         | `ChildToParentMessageClassic.batchNumber`  |
| `indexInBatch`  | `readonly`  | `BigNumber`        | `undefined`   | The index of this message in the batch                                                                                  | `ChildToParentMessageClassic.indexInBatch` |
| `outboxAddress` | `protected` | `null` \| `string` | `null`        | Contains the classic outbox address, or set to zero address if this network<br />did not have a classic outbox deployed | -                                          |

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<null | BigNumber>
```

Estimates the Parent Chain block number in which this Child-to-Parent tx will be available for execution

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

Always returns null for classic chainToParentChain messages since they can be executed in any block now.

###### Source

[message/ChildToParentMessageClassic.ts:386](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L386)

##### getOutboxAddress()

```ts
protected getOutboxAddress(childProvider: Provider, batchNumber: number): Promise<string>
```

Classic had 2 outboxes, we need to find the correct one for the provided batch number

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |
| `batchNumber`   | `number`   |             |

###### Returns

`Promise`\<`string`\>

###### Source

[message/ChildToParentMessageClassic.ts:211](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L211)

##### hasExecuted()

```ts
hasExecuted(childProvider: Provider): Promise<boolean>
```

Check if given outbox message has already been executed

###### Parameters

| Parameter       | Type       |
| :-------------- | :--------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Source

[message/ChildToParentMessageClassic.ts:301](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L301)

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>
```

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

###### Source

[message/ChildToParentMessageClassic.ts:339](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L339)

##### tryGetProof()

```ts
tryGetProof(childProvider: Provider): Promise<null | MessageBatchProofInfo>
```

Get the execution proof for this message. Returns null if the batch does not exist yet.

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `MessageBatchProofInfo`\>

###### Source

[message/ChildToParentMessageClassic.ts:285](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L285)

##### waitUntilOutboxEntryCreated()

```ts
waitUntilOutboxEntryCreated(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
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

[message/ChildToParentMessageClassic.ts:364](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L364)

##### fromBatchNumber()

```ts
static fromBatchNumber<T>(
   parentSignerOrProvider: T,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterClassic<T>
```

Instantiates a new `ChildToParentMessageWriterClassic` or `ChildToParentMessageReaderClassic` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                                                                              |
| :----------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `batchNumber`            | `BigNumber` | The number of the batch containing the Child-to-Parent message.                                                                                                                          |
| `indexInBatch`           | `BigNumber` | The index of the Child-to-Parent message within the batch.                                                                                                                               |
| `parentProvider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderorwriterclassict)\<`T`\>

###### Inherited from

`ChildToParentMessageClassic.fromBatchNumber`

###### Source

[message/ChildToParentMessageClassic.ts:128](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L128)

---

### ChildToParentMessageWriterClassic

Provides read and write access for classic Child-to-Parent-messages

#### Extends

- [`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic)

#### Constructors

##### new ChildToParentMessageWriterClassic()

```ts
new ChildToParentMessageWriterClassic(
   parentSigner: Signer,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
   parentProvider?: Provider): ChildToParentMessageWriterClassic
```

Instantiates a new `ChildToParentMessageWriterClassic` object.

###### Parameters

| Parameter         | Type        | Description                                                                                                                                                                    |
| :---------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSigner`    | `Signer`    | The signer to be used for executing the Child-to-Parent message.                                                                                                               |
| `batchNumber`     | `BigNumber` | The number of the batch containing the Child-to-Parent message.                                                                                                                |
| `indexInBatch`    | `BigNumber` | The index of the Child-to-Parent message within the batch.                                                                                                                     |
| `parentProvider`? | `Provider`  | Optional. Used to override the Provider which is attached to `parentSigner` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageWriterClassic`](ChildToParentMessageClassic.md#childtoparentmessagewriterclassic)

###### Overrides

`ChildToParentMessageReaderClassic.constructor`

###### Source

[message/ChildToParentMessageClassic.ts:406](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L406)

#### Properties

| Property        | Modifier    | Type               | Default value | Description                                                                                                             | Inherited from                                                                                                          |
| :-------------- | :---------- | :----------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `batchNumber`   | `readonly`  | `BigNumber`        | `undefined`   | The number of the batch this message is part of                                                                         | [`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic).`batchNumber`   |
| `indexInBatch`  | `readonly`  | `BigNumber`        | `undefined`   | The index of this message in the batch                                                                                  | [`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic).`indexInBatch`  |
| `outboxAddress` | `protected` | `null` \| `string` | `null`        | Contains the classic outbox address, or set to zero address if this network<br />did not have a classic outbox deployed | [`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic).`outboxAddress` |
| `parentSigner`  | `private`   | `Signer`           | `undefined`   | The signer to be used for executing the Child-to-Parent message.                                                        | -                                                                                                                       |

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

[message/ChildToParentMessageClassic.ts:421](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L421)

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<null | BigNumber>
```

Estimates the Parent Chain block number in which this Child-to-Parent tx will be available for execution

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

Always returns null for classic chainToParentChain messages since they can be executed in any block now.

###### Inherited from

[`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic) . [`getFirstExecutableBlock`](ChildToParentMessageClassic.md#getfirstexecutableblock)

###### Source

[message/ChildToParentMessageClassic.ts:386](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L386)

##### getOutboxAddress()

```ts
protected getOutboxAddress(childProvider: Provider, batchNumber: number): Promise<string>
```

Classic had 2 outboxes, we need to find the correct one for the provided batch number

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |
| `batchNumber`   | `number`   |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic) . [`getOutboxAddress`](ChildToParentMessageClassic.md#getoutboxaddress)

###### Source

[message/ChildToParentMessageClassic.ts:211](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L211)

##### hasExecuted()

```ts
hasExecuted(childProvider: Provider): Promise<boolean>
```

Check if given outbox message has already been executed

###### Parameters

| Parameter       | Type       |
| :-------------- | :--------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic) . [`hasExecuted`](ChildToParentMessageClassic.md#hasexecuted)

###### Source

[message/ChildToParentMessageClassic.ts:301](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L301)

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>
```

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic) . [`status`](ChildToParentMessageClassic.md#status)

###### Source

[message/ChildToParentMessageClassic.ts:339](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L339)

##### tryGetProof()

```ts
tryGetProof(childProvider: Provider): Promise<null | MessageBatchProofInfo>
```

Get the execution proof for this message. Returns null if the batch does not exist yet.

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `MessageBatchProofInfo`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic) . [`tryGetProof`](ChildToParentMessageClassic.md#trygetproof)

###### Source

[message/ChildToParentMessageClassic.ts:285](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L285)

##### waitUntilOutboxEntryCreated()

```ts
waitUntilOutboxEntryCreated(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
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

[`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic) . [`waitUntilOutboxEntryCreated`](ChildToParentMessageClassic.md#waituntiloutboxentrycreated)

###### Source

[message/ChildToParentMessageClassic.ts:364](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L364)

##### fromBatchNumber()

```ts
static fromBatchNumber<T>(
   parentSignerOrProvider: T,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterClassic<T>
```

Instantiates a new `ChildToParentMessageWriterClassic` or `ChildToParentMessageReaderClassic` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                                                                              |
| :----------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `batchNumber`            | `BigNumber` | The number of the batch containing the Child-to-Parent message.                                                                                                                          |
| `indexInBatch`           | `BigNumber` | The index of the Child-to-Parent message within the batch.                                                                                                                               |
| `parentProvider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderorwriterclassict)\<`T`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](ChildToParentMessageClassic.md#childtoparentmessagereaderclassic) . [`fromBatchNumber`](ChildToParentMessageClassic.md#frombatchnumber)

###### Source

[message/ChildToParentMessageClassic.ts:128](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L128)

## Type Aliases

### ChildToParentMessageReaderOrWriterClassic\<T\>

```ts
type ChildToParentMessageReaderOrWriterClassic<T>: T extends Provider ? ChildToParentMessageReaderClassic : ChildToParentMessageWriterClassic;
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

[message/ChildToParentMessageClassic.ts:98](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildToParentMessageClassic.ts#L98)
