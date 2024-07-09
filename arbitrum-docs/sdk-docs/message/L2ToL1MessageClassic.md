---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### L2ToL1MessageReaderClassic

Provides read-only access for classic l2-to-l1-messages

#### Extends

- `L2ToL1MessageClassic`

#### Extended by

- [`L2ToL1MessageWriterClassic`](L2ToL1MessageClassic.md#l2tol1messagewriterclassic)

#### Properties

| Property        | Modifier    | Type               | Default value | Description                                                                                                             | Inherited from                      |
| :-------------- | :---------- | :----------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| `batchNumber`   | `readonly`  | `BigNumber`        | `undefined`   | The number of the batch this message is part of                                                                         | `L2ToL1MessageClassic.batchNumber`  |
| `indexInBatch`  | `readonly`  | `BigNumber`        | `undefined`   | The index of this message in the batch                                                                                  | `L2ToL1MessageClassic.indexInBatch` |
| `outboxAddress` | `protected` | `null` \| `string` | `null`        | Contains the classic outbox address, or set to zero address if this network<br />did not have a classic outbox deployed | -                                   |

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(l2Provider: Provider): Promise<null | BigNumber>
```

Estimates the L1 block number in which this L2 to L1 tx will be available for execution

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

Always returns null for classic l2toL1 messages since they can be executed in any block now.

###### Source

[message/L2ToL1MessageClassic.ts:374](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L374)

##### getOutboxAddress()

```ts
protected getOutboxAddress(l2Provider: Provider, batchNumber: number): Promise<string>
```

Classic had 2 outboxes, we need to find the correct one for the provided batch number

###### Parameters

| Parameter     | Type       | Description |
| :------------ | :--------- | :---------- |
| `l2Provider`  | `Provider` |             |
| `batchNumber` | `number`   |             |

###### Returns

`Promise`\<`string`\>

###### Source

[message/L2ToL1MessageClassic.ts:206](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L206)

##### hasExecuted()

```ts
hasExecuted(l2Provider: Provider): Promise<boolean>
```

Check if given outbox message has already been executed

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Source

[message/L2ToL1MessageClassic.ts:293](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L293)

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

[message/L2ToL1MessageClassic.ts:331](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L331)

##### tryGetProof()

```ts
tryGetProof(l2Provider: Provider): Promise<null | MessageBatchProofInfo>
```

Get the execution proof for this message. Returns null if the batch does not exist yet.

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `MessageBatchProofInfo`\>

###### Source

[message/L2ToL1MessageClassic.ts:277](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L277)

##### waitUntilOutboxEntryCreated()

```ts
waitUntilOutboxEntryCreated(l2Provider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
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

[message/L2ToL1MessageClassic.ts:354](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L354)

##### fromBatchNumber()

```ts
static fromBatchNumber<T>(
   l1SignerOrProvider: T,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
l1Provider?: Provider): L2ToL1MessageReaderOrWriterClassic<T>
```

Instantiates a new `L2ToL1MessageWriterClassic` or `L2ToL1MessageReaderClassic` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type        | Description                                                                                                                                                                          |
| :------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1SignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the L2-to-L1 message.                                                                                                         |
| `batchNumber`        | `BigNumber` | The number of the batch containing the L2-to-L1 message.                                                                                                                             |
| `indexInBatch`       | `BigNumber` | The index of the L2-to-L1 message within the batch.                                                                                                                                  |
| `l1Provider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `l1SignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`L2ToL1MessageReaderOrWriterClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderorwriterclassict)\<`T`\>

###### Inherited from

`L2ToL1MessageClassic.fromBatchNumber`

###### Source

[message/L2ToL1MessageClassic.ts:125](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L125)

---

### L2ToL1MessageWriterClassic

Provides read and write access for classic l2-to-l1-messages

#### Extends

- [`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic)

#### Constructors

##### new L2ToL1MessageWriterClassic()

```ts
new L2ToL1MessageWriterClassic(
   l1Signer: Signer,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
   l1Provider?: Provider): L2ToL1MessageWriterClassic
```

Instantiates a new `L2ToL1MessageWriterClassic` object.

###### Parameters

| Parameter      | Type        | Description                                                                                                                                                                |
| :------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1Signer`     | `Signer`    | The signer to be used for executing the L2-to-L1 message.                                                                                                                  |
| `batchNumber`  | `BigNumber` | The number of the batch containing the L2-to-L1 message.                                                                                                                   |
| `indexInBatch` | `BigNumber` | The index of the L2-to-L1 message within the batch.                                                                                                                        |
| `l1Provider`?  | `Provider`  | Optional. Used to override the Provider which is attached to `l1Signer` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`L2ToL1MessageWriterClassic`](L2ToL1MessageClassic.md#l2tol1messagewriterclassic)

###### Overrides

`L2ToL1MessageReaderClassic.constructor`

###### Source

[message/L2ToL1MessageClassic.ts:394](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L394)

#### Properties

| Property        | Modifier    | Type               | Default value | Description                                                                                                             | Inherited from                                                                                     |
| :-------------- | :---------- | :----------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `batchNumber`   | `readonly`  | `BigNumber`        | `undefined`   | The number of the batch this message is part of                                                                         | [`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic).`batchNumber`   |
| `indexInBatch`  | `readonly`  | `BigNumber`        | `undefined`   | The index of this message in the batch                                                                                  | [`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic).`indexInBatch`  |
| `l1Signer`      | `private`   | `Signer`           | `undefined`   | The signer to be used for executing the L2-to-L1 message.                                                               | -                                                                                                  |
| `outboxAddress` | `protected` | `null` \| `string` | `null`        | Contains the classic outbox address, or set to zero address if this network<br />did not have a classic outbox deployed | [`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic).`outboxAddress` |

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

[message/L2ToL1MessageClassic.ts:409](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L409)

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(l2Provider: Provider): Promise<null | BigNumber>
```

Estimates the L1 block number in which this L2 to L1 tx will be available for execution

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `BigNumber`\>

Always returns null for classic l2toL1 messages since they can be executed in any block now.

###### Inherited from

[`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic) . [`getFirstExecutableBlock`](L2ToL1MessageClassic.md#getfirstexecutableblock)

###### Source

[message/L2ToL1MessageClassic.ts:374](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L374)

##### getOutboxAddress()

```ts
protected getOutboxAddress(l2Provider: Provider, batchNumber: number): Promise<string>
```

Classic had 2 outboxes, we need to find the correct one for the provided batch number

###### Parameters

| Parameter     | Type       | Description |
| :------------ | :--------- | :---------- |
| `l2Provider`  | `Provider` |             |
| `batchNumber` | `number`   |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic) . [`getOutboxAddress`](L2ToL1MessageClassic.md#getoutboxaddress)

###### Source

[message/L2ToL1MessageClassic.ts:206](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L206)

##### hasExecuted()

```ts
hasExecuted(l2Provider: Provider): Promise<boolean>
```

Check if given outbox message has already been executed

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic) . [`hasExecuted`](L2ToL1MessageClassic.md#hasexecuted)

###### Source

[message/L2ToL1MessageClassic.ts:293](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L293)

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

[`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic) . [`status`](L2ToL1MessageClassic.md#status)

###### Source

[message/L2ToL1MessageClassic.ts:331](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L331)

##### tryGetProof()

```ts
tryGetProof(l2Provider: Provider): Promise<null | MessageBatchProofInfo>
```

Get the execution proof for this message. Returns null if the batch does not exist yet.

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`null` \| `MessageBatchProofInfo`\>

###### Inherited from

[`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic) . [`tryGetProof`](L2ToL1MessageClassic.md#trygetproof)

###### Source

[message/L2ToL1MessageClassic.ts:277](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L277)

##### waitUntilOutboxEntryCreated()

```ts
waitUntilOutboxEntryCreated(l2Provider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>
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

[`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic) . [`waitUntilOutboxEntryCreated`](L2ToL1MessageClassic.md#waituntiloutboxentrycreated)

###### Source

[message/L2ToL1MessageClassic.ts:354](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L354)

##### fromBatchNumber()

```ts
static fromBatchNumber<T>(
   l1SignerOrProvider: T,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
l1Provider?: Provider): L2ToL1MessageReaderOrWriterClassic<T>
```

Instantiates a new `L2ToL1MessageWriterClassic` or `L2ToL1MessageReaderClassic` object.

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type        | Description                                                                                                                                                                          |
| :------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1SignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the L2-to-L1 message.                                                                                                         |
| `batchNumber`        | `BigNumber` | The number of the batch containing the L2-to-L1 message.                                                                                                                             |
| `indexInBatch`       | `BigNumber` | The index of the L2-to-L1 message within the batch.                                                                                                                                  |
| `l1Provider`?        | `Provider`  | Optional. Used to override the Provider which is attached to `l1SignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`L2ToL1MessageReaderOrWriterClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderorwriterclassict)\<`T`\>

###### Inherited from

[`L2ToL1MessageReaderClassic`](L2ToL1MessageClassic.md#l2tol1messagereaderclassic) . [`fromBatchNumber`](L2ToL1MessageClassic.md#frombatchnumber)

###### Source

[message/L2ToL1MessageClassic.ts:125](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L125)

## Type Aliases

### L2ToL1MessageReaderOrWriterClassic\<T\>

```ts
type L2ToL1MessageReaderOrWriterClassic<T>: T extends Provider ? L2ToL1MessageReaderClassic : L2ToL1MessageWriterClassic;
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

[message/L2ToL1MessageClassic.ts:98](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2ToL1MessageClassic.ts#L98)
