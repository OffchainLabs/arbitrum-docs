## Classes

### ChildToParentMessageReaderClassic

Defined in: message/ChildToParentMessageClassic.ts:190

Provides read-only access for classic Child-to-Parent-messages

#### Extended by

- [`ChildToParentMessageWriterClassic`](#childtoparentmessagewriterclassic)

#### Properties

| Property                                   | Modifier    | Type               | Default value | Description                                                                                                        | Inherited from                             | Defined in                                 |
| ------------------------------------------ | ----------- | ------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
| <a id="batchnumber"></a> `batchNumber`     | `readonly`  | `BigNumber`        | `undefined`   | The number of the batch this message is part of                                                                    | `ChildToParentMessageClassic.batchNumber`  | message/ChildToParentMessageClassic.ts:108 |
| <a id="indexinbatch"></a> `indexInBatch`   | `readonly`  | `BigNumber`        | `undefined`   | The index of this message in the batch                                                                             | `ChildToParentMessageClassic.indexInBatch` | message/ChildToParentMessageClassic.ts:113 |
| <a id="outboxaddress"></a> `outboxAddress` | `protected` | `string` \| `null` | `null`        | Contains the classic outbox address, or set to zero address if this network did not have a classic outbox deployed | -                                          | message/ChildToParentMessageClassic.ts:203 |

#### Methods

##### getFirstExecutableBlock()

```ts
getFirstExecutableBlock(childProvider: Provider): Promise<BigNumber | null>;
```

Defined in: message/ChildToParentMessageClassic.ts:386

Estimates the Parent Chain block number in which this Child-to-Parent tx will be available for execution

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`BigNumber` \| `null`\>

Always returns null for classic chainToParentChain messages since they can be executed in any block now.

##### getOutboxAddress()

```ts
protected getOutboxAddress(childProvider: Provider, batchNumber: number): Promise<string>;
```

Defined in: message/ChildToParentMessageClassic.ts:211

Classic had 2 outboxes, we need to find the correct one for the provided batch number

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |
| `batchNumber`   | `number`   |             |

###### Returns

`Promise`\<`string`\>

##### hasExecuted()

```ts
hasExecuted(childProvider: Provider): Promise<boolean>;
```

Defined in: message/ChildToParentMessageClassic.ts:301

Check if given outbox message has already been executed

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

Defined in: message/ChildToParentMessageClassic.ts:339

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

##### tryGetProof()

```ts
tryGetProof(childProvider: Provider): Promise<MessageBatchProofInfo | null>;
```

Defined in: message/ChildToParentMessageClassic.ts:285

Get the execution proof for this message. Returns null if the batch does not exist yet.

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`MessageBatchProofInfo` \| `null`\>

##### waitUntilOutboxEntryCreated()

```ts
waitUntilOutboxEntryCreated(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>;
```

Defined in: message/ChildToParentMessageClassic.ts:364

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

##### fromBatchNumber()

```ts
static fromBatchNumber<T>(
   parentSignerOrProvider: T,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterClassic<T>;
```

Defined in: message/ChildToParentMessageClassic.ts:128

Instantiates a new `ChildToParentMessageWriterClassic` or `ChildToParentMessageReaderClassic` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                                                                              |
| ------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `batchNumber`            | `BigNumber` | The number of the batch containing the Child-to-Parent message.                                                                                                                          |
| `indexInBatch`           | `BigNumber` | The index of the Child-to-Parent message within the batch.                                                                                                                               |
| `parentProvider?`        | `Provider`  | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterClassic`](#childtoparentmessagereaderorwriterclassic)\<`T`\>

###### Inherited from

```ts
ChildToParentMessageClassic.fromBatchNumber;
```

---

### ChildToParentMessageWriterClassic

Defined in: message/ChildToParentMessageClassic.ts:397

Provides read and write access for classic Child-to-Parent-messages

#### Extends

- [`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic)

#### Constructors

##### Constructor

```ts
new ChildToParentMessageWriterClassic(
   parentSigner: Signer,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
   parentProvider?: Provider): ChildToParentMessageWriterClassic;
```

Defined in: message/ChildToParentMessageClassic.ts:406

Instantiates a new `ChildToParentMessageWriterClassic` object.

###### Parameters

| Parameter         | Type        | Description                                                                                                                                                                    |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `parentSigner`    | `Signer`    | The signer to be used for executing the Child-to-Parent message.                                                                                                               |
| `batchNumber`     | `BigNumber` | The number of the batch containing the Child-to-Parent message.                                                                                                                |
| `indexInBatch`    | `BigNumber` | The index of the Child-to-Parent message within the batch.                                                                                                                     |
| `parentProvider?` | `Provider`  | Optional. Used to override the Provider which is attached to `parentSigner` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageWriterClassic`](#childtoparentmessagewriterclassic)

###### Overrides

```ts
ChildToParentMessageReaderClassic.constructor;
```

#### Properties

| Property                                     | Modifier    | Type               | Default value | Description                                                                                                        | Inherited from                                                                                              | Defined in                                 |
| -------------------------------------------- | ----------- | ------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| <a id="batchnumber-1"></a> `batchNumber`     | `readonly`  | `BigNumber`        | `undefined`   | The number of the batch this message is part of                                                                    | [`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`batchNumber`](#batchnumber)     | message/ChildToParentMessageClassic.ts:108 |
| <a id="indexinbatch-1"></a> `indexInBatch`   | `readonly`  | `BigNumber`        | `undefined`   | The index of this message in the batch                                                                             | [`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`indexInBatch`](#indexinbatch)   | message/ChildToParentMessageClassic.ts:113 |
| <a id="outboxaddress-1"></a> `outboxAddress` | `protected` | `string` \| `null` | `null`        | Contains the classic outbox address, or set to zero address if this network did not have a classic outbox deployed | [`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`outboxAddress`](#outboxaddress) | message/ChildToParentMessageClassic.ts:203 |

#### Methods

##### execute()

```ts
execute(childProvider: Provider, overrides?: Overrides): Promise<ContractTransaction>;
```

Defined in: message/ChildToParentMessageClassic.ts:421

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

Defined in: message/ChildToParentMessageClassic.ts:386

Estimates the Parent Chain block number in which this Child-to-Parent tx will be available for execution

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`BigNumber` \| `null`\>

Always returns null for classic chainToParentChain messages since they can be executed in any block now.

###### Inherited from

[`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`getFirstExecutableBlock`](#getfirstexecutableblock)

##### getOutboxAddress()

```ts
protected getOutboxAddress(childProvider: Provider, batchNumber: number): Promise<string>;
```

Defined in: message/ChildToParentMessageClassic.ts:211

Classic had 2 outboxes, we need to find the correct one for the provided batch number

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |
| `batchNumber`   | `number`   |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`getOutboxAddress`](#getoutboxaddress)

##### hasExecuted()

```ts
hasExecuted(childProvider: Provider): Promise<boolean>;
```

Defined in: message/ChildToParentMessageClassic.ts:301

Check if given outbox message has already been executed

###### Parameters

| Parameter       | Type       |
| --------------- | ---------- |
| `childProvider` | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`hasExecuted`](#hasexecuted)

##### status()

```ts
status(childProvider: Provider): Promise<ChildToParentMessageStatus>;
```

Defined in: message/ChildToParentMessageClassic.ts:339

Get the status of this message
In order to check if the message has been executed proof info must be provided.

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ChildToParentMessageStatus`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`status`](#status)

##### tryGetProof()

```ts
tryGetProof(childProvider: Provider): Promise<MessageBatchProofInfo | null>;
```

Defined in: message/ChildToParentMessageClassic.ts:285

Get the execution proof for this message. Returns null if the batch does not exist yet.

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`MessageBatchProofInfo` \| `null`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`tryGetProof`](#trygetproof)

##### waitUntilOutboxEntryCreated()

```ts
waitUntilOutboxEntryCreated(childProvider: Provider, retryDelay: number): Promise<CONFIRMED | EXECUTED>;
```

Defined in: message/ChildToParentMessageClassic.ts:364

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

[`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`waitUntilOutboxEntryCreated`](#waituntiloutboxentrycreated)

##### fromBatchNumber()

```ts
static fromBatchNumber<T>(
   parentSignerOrProvider: T,
   batchNumber: BigNumber,
   indexInBatch: BigNumber,
parentProvider?: Provider): ChildToParentMessageReaderOrWriterClassic<T>;
```

Defined in: message/ChildToParentMessageClassic.ts:128

Instantiates a new `ChildToParentMessageWriterClassic` or `ChildToParentMessageReaderClassic` object.

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type        | Description                                                                                                                                                                              |
| ------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentSignerOrProvider` | `T`         | Signer or provider to be used for executing or reading the Child-to-Parent message.                                                                                                      |
| `batchNumber`            | `BigNumber` | The number of the batch containing the Child-to-Parent message.                                                                                                                          |
| `indexInBatch`           | `BigNumber` | The index of the Child-to-Parent message within the batch.                                                                                                                               |
| `parentProvider?`        | `Provider`  | Optional. Used to override the Provider which is attached to `parentSignerOrProvider` in case you need more control. This will be a required parameter in a future major version update. |

###### Returns

[`ChildToParentMessageReaderOrWriterClassic`](#childtoparentmessagereaderorwriterclassic)\<`T`\>

###### Inherited from

[`ChildToParentMessageReaderClassic`](#childtoparentmessagereaderclassic).[`fromBatchNumber`](#frombatchnumber)

## Type Aliases

### ChildToParentMessageReaderOrWriterClassic

```ts
type ChildToParentMessageReaderOrWriterClassic<T> = T extends Provider
  ? ChildToParentMessageReaderClassic
  : ChildToParentMessageWriterClassic;
```

Defined in: message/ChildToParentMessageClassic.ts:98

Conditional type for Signer or Provider. If T is of type Provider
then ChildToParentMessageReaderOrWriter\<T\> will be of type ChildToParentMessageReader.
If T is of type Signer then ChildToParentMessageReaderOrWriter\<T\> will be of
type ChildToParentMessageWriter.

#### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |
