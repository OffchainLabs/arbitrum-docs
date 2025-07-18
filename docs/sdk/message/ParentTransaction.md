---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ParentContractCallTransactionReceipt

A ParentTransactionReceipt with additional functionality that only exists
if the transaction created a single call to a child chain contract - this includes
token deposits.

#### Extends

- `ParentTransactionReceipt`

#### Methods

##### getEthDeposits()

```ts
getEthDeposits(childProvider: Provider): Promise<EthDepositMessage[]>
```

Get any eth deposit messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise` \<[`EthDepositMessage`](ParentToChildMessage.md#ethdepositmessage)[]\>

###### Inherited from

`ParentTransactionReceipt.getEthDeposits`

###### Source

[message/ParentTransaction.ts:191](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L191)

##### getInboxMessageDeliveredEvents()

```ts
getInboxMessageDeliveredEvents(): object[]
```

Get any InboxMessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getInboxMessageDeliveredEvents`

###### Source

[message/ParentTransaction.ts:134](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L134)

##### getMessageDeliveredEvents()

```ts
getMessageDeliveredEvents(): object[]
```

Get any MessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getMessageDeliveredEvents`

###### Source

[message/ParentTransaction.ts:126](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L126)

##### getMessageEvents()

```ts
getMessageEvents(): object[]
```

Get combined data for any InboxMessageDelivered and MessageDelivered events
emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getMessageEvents`

###### Source

[message/ParentTransaction.ts:147](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L147)

##### getParentToChildMessages()

```ts
getParentToChildMessages<T>(childSignerOrProvider: T): Promise<ParentToChildMessageReaderOrWriter<T>[]>
```

Get any parent-to-child messages created by this transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| :---------------------- | :--- | :---------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise` \<[`ParentToChildMessageReaderOrWriter`](ParentToChildMessage.md#parenttochildmessagereaderorwritert)\<`T`\>[]\>

###### Inherited from

`ParentTransactionReceipt.getParentToChildMessages`

###### Source

[message/ParentTransaction.ts:248](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L248)

##### getParentToChildMessagesClassic()

```ts
getParentToChildMessagesClassic(childProvider: Provider): Promise<ParentToChildMessageReaderClassic[]>
```

Get classic parent-to-child messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ParentToChildMessageReaderClassic`[]\>

###### Inherited from

`ParentTransactionReceipt.getParentToChildMessagesClassic`

###### Source

[message/ParentTransaction.ts:216](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L216)

##### getTokenDepositEvents()

```ts
getTokenDepositEvents(): object[]
```

Get any token deposit events created by this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getTokenDepositEvents`

###### Source

[message/ParentTransaction.ts:298](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L298)

##### isClassic()

```ts
isClassic<T>(childSignerOrProvider: T): Promise<boolean>
```

Check if is a classic transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| :---------------------- | :--- | :---------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

`ParentTransactionReceipt.isClassic`

###### Source

[message/ParentTransaction.ts:106](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L106)

##### waitForChildTransactionReceipt()

```ts
waitForChildTransactionReceipt<T>(
   childSignerOrProvider: T,
   confirmations?: number,
timeout?: number): Promise<object & ParentToChildMessageWaitForStatusResult>
```

Wait for the transaction to arrive and be executed on the child chain

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type     | Description                                                                                                                                                                                    |
| :---------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childSignerOrProvider` | `T`      | -                                                                                                                                                                                              |
| `confirmations`?        | `number` | Amount of confirmations the retryable ticket and the auto redeem receipt should have                                                                                                           |
| `timeout`?              | `number` | Amount of time to wait for the retryable ticket to be created<br />Defaults to 15 minutes, as by this time all transactions are expected to be included on the child chain. Throws on timeout. |

###### Returns

`Promise`\<`object` & [`ParentToChildMessageWaitForStatusResult`](ParentToChildMessage.md#parenttochildmessagewaitforstatusresult)\>

The wait result contains `complete`, a `status`, a ParentToChildMessage and optionally the `childTxReceipt`.
If `complete` is true then this message is in the terminal state.
For contract calls this is true only if the status is REDEEMED.

###### Source

[message/ParentTransaction.ts:407](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L407)

##### monkeyPatchContractCallWait()

```ts
static monkeyPatchContractCallWait(contractTransaction: ContractTransaction): ParentContractCallTransaction
```

Replaces the wait function with one that returns a [ParentContractCallTransactionReceipt](ParentTransaction.md#parentcontractcalltransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractCallTransaction`

###### Inherited from

`ParentTransactionReceipt.monkeyPatchContractCallWait`

###### Source

[message/ParentTransaction.ts:343](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L343)

##### monkeyPatchEthDepositWait()

```ts
static monkeyPatchEthDepositWait(contractTransaction: ContractTransaction): ParentEthDepositTransaction
```

Replaces the wait function with one that returns a [ParentEthDepositTransactionReceipt](ParentTransaction.md#parentethdeposittransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentEthDepositTransaction`

###### Inherited from

`ParentTransactionReceipt.monkeyPatchEthDepositWait`

###### Source

[message/ParentTransaction.ts:327](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L327)

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): ParentContractTransaction<ParentTransactionReceipt>
```

Replaces the wait function with one that returns a ParentTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractTransaction`\<`ParentTransactionReceipt`\>

###### Inherited from

`ParentTransactionReceipt.monkeyPatchWait`

###### Source

[message/ParentTransaction.ts:311](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L311)

---

### ParentEthDepositTransactionReceipt

A ParentTransactionReceipt with additional functionality that only exists
if the transaction created a single eth deposit.

#### Extends

- `ParentTransactionReceipt`

#### Methods

##### getEthDeposits()

```ts
getEthDeposits(childProvider: Provider): Promise<EthDepositMessage[]>
```

Get any eth deposit messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise` \<[`EthDepositMessage`](ParentToChildMessage.md#ethdepositmessage)[]\>

###### Inherited from

`ParentTransactionReceipt.getEthDeposits`

###### Source

[message/ParentTransaction.ts:191](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L191)

##### getInboxMessageDeliveredEvents()

```ts
getInboxMessageDeliveredEvents(): object[]
```

Get any InboxMessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getInboxMessageDeliveredEvents`

###### Source

[message/ParentTransaction.ts:134](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L134)

##### getMessageDeliveredEvents()

```ts
getMessageDeliveredEvents(): object[]
```

Get any MessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getMessageDeliveredEvents`

###### Source

[message/ParentTransaction.ts:126](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L126)

##### getMessageEvents()

```ts
getMessageEvents(): object[]
```

Get combined data for any InboxMessageDelivered and MessageDelivered events
emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getMessageEvents`

###### Source

[message/ParentTransaction.ts:147](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L147)

##### getParentToChildMessages()

```ts
getParentToChildMessages<T>(childSignerOrProvider: T): Promise<ParentToChildMessageReaderOrWriter<T>[]>
```

Get any parent-to-child messages created by this transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| :---------------------- | :--- | :---------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise` \<[`ParentToChildMessageReaderOrWriter`](ParentToChildMessage.md#parenttochildmessagereaderorwritert)\<`T`\>[]\>

###### Inherited from

`ParentTransactionReceipt.getParentToChildMessages`

###### Source

[message/ParentTransaction.ts:248](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L248)

##### getParentToChildMessagesClassic()

```ts
getParentToChildMessagesClassic(childProvider: Provider): Promise<ParentToChildMessageReaderClassic[]>
```

Get classic parent-to-child messages created by this transaction

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<`ParentToChildMessageReaderClassic`[]\>

###### Inherited from

`ParentTransactionReceipt.getParentToChildMessagesClassic`

###### Source

[message/ParentTransaction.ts:216](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L216)

##### getTokenDepositEvents()

```ts
getTokenDepositEvents(): object[]
```

Get any token deposit events created by this transaction

###### Returns

`object`[]

###### Inherited from

`ParentTransactionReceipt.getTokenDepositEvents`

###### Source

[message/ParentTransaction.ts:298](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L298)

##### isClassic()

```ts
isClassic<T>(childSignerOrProvider: T): Promise<boolean>
```

Check if is a classic transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter               | Type | Description |
| :---------------------- | :--- | :---------- |
| `childSignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

`ParentTransactionReceipt.isClassic`

###### Source

[message/ParentTransaction.ts:106](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L106)

##### waitForChildTransactionReceipt()

```ts
waitForChildTransactionReceipt(
   childProvider: Provider,
   confirmations?: number,
timeout?: number): Promise<object & EthDepositMessageWaitForStatusResult>
```

Wait for the funds to arrive on the child chain

###### Parameters

| Parameter        | Type       | Description                                                                                                                                                                                    |
| :--------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childProvider`  | `Provider` | -                                                                                                                                                                                              |
| `confirmations`? | `number`   | Amount of confirmations the retryable ticket and the auto redeem receipt should have                                                                                                           |
| `timeout`?       | `number`   | Amount of time to wait for the retryable ticket to be created<br />Defaults to 15 minutes, as by this time all transactions are expected to be included on the child chain. Throws on timeout. |

###### Returns

`Promise`\<`object` & `EthDepositMessageWaitForStatusResult`\>

The wait result contains `complete`, a `status`, the ParentToChildMessage and optionally the `childTxReceipt`
If `complete` is true then this message is in the terminal state.
For eth deposits complete this is when the status is FUNDS_DEPOSITED, EXPIRED or REDEEMED.

###### Source

[message/ParentTransaction.ts:369](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L369)

##### monkeyPatchContractCallWait()

```ts
static monkeyPatchContractCallWait(contractTransaction: ContractTransaction): ParentContractCallTransaction
```

Replaces the wait function with one that returns a [ParentContractCallTransactionReceipt](ParentTransaction.md#parentcontractcalltransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractCallTransaction`

###### Inherited from

`ParentTransactionReceipt.monkeyPatchContractCallWait`

###### Source

[message/ParentTransaction.ts:343](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L343)

##### monkeyPatchEthDepositWait()

```ts
static monkeyPatchEthDepositWait(contractTransaction: ContractTransaction): ParentEthDepositTransaction
```

Replaces the wait function with one that returns a [ParentEthDepositTransactionReceipt](ParentTransaction.md#parentethdeposittransactionreceipt)

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentEthDepositTransaction`

###### Inherited from

`ParentTransactionReceipt.monkeyPatchEthDepositWait`

###### Source

[message/ParentTransaction.ts:327](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L327)

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): ParentContractTransaction<ParentTransactionReceipt>
```

Replaces the wait function with one that returns a ParentTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ParentContractTransaction`\<`ParentTransactionReceipt`\>

###### Inherited from

`ParentTransactionReceipt.monkeyPatchWait`

###### Source

[message/ParentTransaction.ts:311](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentTransaction.ts#L311)
