---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ParentContractCallTransactionReceipt

Defined in: [message/ParentTransaction.ts:397](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L397)

A ParentTransactionReceipt with additional functionality that only exists
if the transaction created a single call to a child chain contract - this includes
token deposits.

#### Methods

##### getEthDeposits()

```ts
getEthDeposits(childProvider: Provider): Promise<EthDepositMessage[]>;
```

Defined in: [message/ParentTransaction.ts:191](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L191)

Get any eth deposit messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<[`EthDepositMessage`](ParentToChildMessage.md#ethdepositmessage)[]\>

###### Inherited from

```ts
ParentTransactionReceipt.getEthDeposits;
```

##### getInboxMessageDeliveredEvents()

```ts
getInboxMessageDeliveredEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:134](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L134)

Get any InboxMessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getInboxMessageDeliveredEvents;
```

##### getMessageDeliveredEvents()

```ts
getMessageDeliveredEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:126](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L126)

Get any MessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getMessageDeliveredEvents;
```

##### getMessageEvents()

```ts
getMessageEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:147](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L147)

Get combined data for any InboxMessageDelivered and MessageDelivered events
emitted during this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getMessageEvents;
```

##### getParentToChildMessages()

```ts
getParentToChildMessages<T>(childSignerOrProvider: T): Promise<ParentToChildMessageReaderOrWriter<T>[]>;
```

Defined in: [message/ParentTransaction.ts:248](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L248)

Get any parent-to-child messages created by this transaction

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| ----------------------- | ---- | ----------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<[`ParentToChildMessageReaderOrWriter`](ParentToChildMessage.md#parenttochildmessagereaderorwriter)\<`T`\>[]\>

###### Inherited from

```ts
ParentTransactionReceipt.getParentToChildMessages;
```

##### getParentToChildMessagesClassic()

```ts
getParentToChildMessagesClassic(childProvider: Provider): Promise<ParentToChildMessageReaderClassic[]>;
```

Defined in: [message/ParentTransaction.ts:216](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L216)

Get classic parent-to-child messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ParentToChildMessageReaderClassic`[]\>

###### Inherited from

```ts
ParentTransactionReceipt.getParentToChildMessagesClassic;
```

##### getTokenDepositEvents()

```ts
getTokenDepositEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:298](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L298)

Get any token deposit events created by this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getTokenDepositEvents;
```

##### isClassic()

```ts
isClassic<T>(childSignerOrProvider: T): Promise<boolean>;
```

Defined in: [message/ParentTransaction.ts:106](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L106)

Check if is a classic transaction

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| ----------------------- | ---- | ----------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

```ts
ParentTransactionReceipt.isClassic;
```

##### waitForChildTransactionReceipt()

```ts
waitForChildTransactionReceipt<T>(
   childSignerOrProvider: T,
   confirmations?: number,
timeout?: number): Promise<object & ParentToChildMessageWaitForStatusResult>;
```

Defined in: [message/ParentTransaction.ts:407](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L407)

Wait for the transaction to arrive and be executed on the child chain

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type     | Description                                                                                                                                                                               |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childSignerOrProvider` | `T`      | -                                                                                                                                                                                         |
| `confirmations?`        | `number` | Amount of confirmations the retryable ticket and the auto redeem receipt should have                                                                                                      |
| `timeout?`              | `number` | Amount of time to wait for the retryable ticket to be created Defaults to 15 minutes, as by this time all transactions are expected to be included on the child chain. Throws on timeout. |

###### Returns

`Promise`\<`object` & [`ParentToChildMessageWaitForStatusResult`](ParentToChildMessage.md#parenttochildmessagewaitforstatusresult)\>

The wait result contains `complete`, a `status`, a ParentToChildMessage and optionally the `childTxReceipt`.
If `complete` is true then this message is in the terminal state.
For contract calls this is true only if the status is REDEEMED.

##### monkeyPatchContractCallWait()

```ts
static monkeyPatchContractCallWait(contractTransaction: ContractTransaction): ParentContractCallTransaction;
```

Defined in: [message/ParentTransaction.ts:343](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L343)

Replaces the wait function with one that returns a [ParentContractCallTransactionReceipt](#parentcontractcalltransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| --------------------- | --------------------- | ----------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractCallTransaction`

###### Inherited from

```ts
ParentTransactionReceipt.monkeyPatchContractCallWait;
```

##### monkeyPatchEthDepositWait()

```ts
static monkeyPatchEthDepositWait(contractTransaction: ContractTransaction): ParentEthDepositTransaction;
```

Defined in: [message/ParentTransaction.ts:327](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L327)

Replaces the wait function with one that returns a [ParentEthDepositTransactionReceipt](#parentethdeposittransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| --------------------- | --------------------- | ----------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentEthDepositTransaction`

###### Inherited from

```ts
ParentTransactionReceipt.monkeyPatchEthDepositWait;
```

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): ParentContractTransaction;
```

Defined in: [message/ParentTransaction.ts:311](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L311)

Replaces the wait function with one that returns a ParentTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| --------------------- | --------------------- | ----------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractTransaction`

###### Inherited from

```ts
ParentTransactionReceipt.monkeyPatchWait;
```

---

### ParentEthDepositTransactionReceipt

Defined in: [message/ParentTransaction.ts:359](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L359)

A ParentTransactionReceipt with additional functionality that only exists
if the transaction created a single eth deposit.

#### Methods

##### getEthDeposits()

```ts
getEthDeposits(childProvider: Provider): Promise<EthDepositMessage[]>;
```

Defined in: [message/ParentTransaction.ts:191](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L191)

Get any eth deposit messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<[`EthDepositMessage`](ParentToChildMessage.md#ethdepositmessage)[]\>

###### Inherited from

```ts
ParentTransactionReceipt.getEthDeposits;
```

##### getInboxMessageDeliveredEvents()

```ts
getInboxMessageDeliveredEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:134](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L134)

Get any InboxMessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getInboxMessageDeliveredEvents;
```

##### getMessageDeliveredEvents()

```ts
getMessageDeliveredEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:126](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L126)

Get any MessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getMessageDeliveredEvents;
```

##### getMessageEvents()

```ts
getMessageEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:147](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L147)

Get combined data for any InboxMessageDelivered and MessageDelivered events
emitted during this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getMessageEvents;
```

##### getParentToChildMessages()

```ts
getParentToChildMessages<T>(childSignerOrProvider: T): Promise<ParentToChildMessageReaderOrWriter<T>[]>;
```

Defined in: [message/ParentTransaction.ts:248](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L248)

Get any parent-to-child messages created by this transaction

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| ----------------------- | ---- | ----------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<[`ParentToChildMessageReaderOrWriter`](ParentToChildMessage.md#parenttochildmessagereaderorwriter)\<`T`\>[]\>

###### Inherited from

```ts
ParentTransactionReceipt.getParentToChildMessages;
```

##### getParentToChildMessagesClassic()

```ts
getParentToChildMessagesClassic(childProvider: Provider): Promise<ParentToChildMessageReaderClassic[]>;
```

Defined in: [message/ParentTransaction.ts:216](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L216)

Get classic parent-to-child messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ParentToChildMessageReaderClassic`[]\>

###### Inherited from

```ts
ParentTransactionReceipt.getParentToChildMessagesClassic;
```

##### getTokenDepositEvents()

```ts
getTokenDepositEvents(): object[];
```

Defined in: [message/ParentTransaction.ts:298](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L298)

Get any token deposit events created by this transaction

###### Returns

`object`[]

###### Inherited from

```ts
ParentTransactionReceipt.getTokenDepositEvents;
```

##### isClassic()

```ts
isClassic<T>(childSignerOrProvider: T): Promise<boolean>;
```

Defined in: [message/ParentTransaction.ts:106](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L106)

Check if is a classic transaction

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| ----------------------- | ---- | ----------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

```ts
ParentTransactionReceipt.isClassic;
```

##### waitForChildTransactionReceipt()

```ts
waitForChildTransactionReceipt(
   childProvider: Provider,
   confirmations?: number,
timeout?: number): Promise<object & EthDepositMessageWaitForStatusResult>;
```

Defined in: [message/ParentTransaction.ts:369](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L369)

Wait for the funds to arrive on the child chain

###### Parameters

| Parameter        | Type       | Description                                                                                                                                                                               |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`  | `Provider` | -                                                                                                                                                                                         |
| `confirmations?` | `number`   | Amount of confirmations the retryable ticket and the auto redeem receipt should have                                                                                                      |
| `timeout?`       | `number`   | Amount of time to wait for the retryable ticket to be created Defaults to 15 minutes, as by this time all transactions are expected to be included on the child chain. Throws on timeout. |

###### Returns

`Promise`\<`object` & `EthDepositMessageWaitForStatusResult`\>

The wait result contains `complete`, a `status`, the ParentToChildMessage and optionally the `childTxReceipt`
If `complete` is true then this message is in the terminal state.
For eth deposits complete this is when the status is FUNDS_DEPOSITED, EXPIRED or REDEEMED.

##### monkeyPatchContractCallWait()

```ts
static monkeyPatchContractCallWait(contractTransaction: ContractTransaction): ParentContractCallTransaction;
```

Defined in: [message/ParentTransaction.ts:343](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L343)

Replaces the wait function with one that returns a [ParentContractCallTransactionReceipt](#parentcontractcalltransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| --------------------- | --------------------- | ----------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractCallTransaction`

###### Inherited from

```ts
ParentTransactionReceipt.monkeyPatchContractCallWait;
```

##### monkeyPatchEthDepositWait()

```ts
static monkeyPatchEthDepositWait(contractTransaction: ContractTransaction): ParentEthDepositTransaction;
```

Defined in: [message/ParentTransaction.ts:327](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L327)

Replaces the wait function with one that returns a [ParentEthDepositTransactionReceipt](#parentethdeposittransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| --------------------- | --------------------- | ----------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentEthDepositTransaction`

###### Inherited from

```ts
ParentTransactionReceipt.monkeyPatchEthDepositWait;
```

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): ParentContractTransaction;
```

Defined in: [message/ParentTransaction.ts:311](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L311)

Replaces the wait function with one that returns a ParentTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| --------------------- | --------------------- | ----------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractTransaction`

###### Inherited from

```ts
ParentTransactionReceipt.monkeyPatchWait;
```
