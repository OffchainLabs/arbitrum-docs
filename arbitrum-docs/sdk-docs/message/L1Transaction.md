---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### L1ContractCallTransactionReceipt

An L1TransactionReceipt with additional functionality that only exists
if the transaction created a single call to an L2 contract - this includes
token deposits.

#### Extends

- `L1TransactionReceipt`

#### Methods

##### getEthDeposits()

```ts
getEthDeposits(l2Provider: Provider): Promise<EthDepositMessage[]>
```

Get any eth deposit messages created by this transaction

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise` \<[`EthDepositMessage`](L1ToL2Message.md#ethdepositmessage)[]\>

###### Inherited from

`L1TransactionReceipt.getEthDeposits`

###### Source

[message/L1Transaction.ts:182](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L182)

##### getInboxMessageDeliveredEvents()

```ts
getInboxMessageDeliveredEvents(): object[]
```

Get any InboxMessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getInboxMessageDeliveredEvents`

###### Source

[message/L1Transaction.ts:125](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L125)

##### getL1ToL2Messages()

```ts
getL1ToL2Messages<T>(l2SignerOrProvider: T): Promise<L1ToL2MessageReaderOrWriter<T>[]>
```

Get any l1tol2 messages created by this transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type | Description |
| :------------------- | :--- | :---------- |
| `l2SignerOrProvider` | `T`  |             |

###### Returns

`Promise` \<[`L1ToL2MessageReaderOrWriter`](L1ToL2Message.md#l1tol2messagereaderorwritert)\<`T`\>[]\>

###### Inherited from

`L1TransactionReceipt.getL1ToL2Messages`

###### Source

[message/L1Transaction.ts:239](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L239)

##### getL1ToL2MessagesClassic()

```ts
getL1ToL2MessagesClassic(l2Provider: Provider): Promise<L1ToL2MessageReaderClassic[]>
```

Get classic l1tol2 messages created by this transaction

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`L1ToL2MessageReaderClassic`[]\>

###### Inherited from

`L1TransactionReceipt.getL1ToL2MessagesClassic`

###### Source

[message/L1Transaction.ts:207](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L207)

##### getMessageDeliveredEvents()

```ts
getMessageDeliveredEvents(): object[]
```

Get any MessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getMessageDeliveredEvents`

###### Source

[message/L1Transaction.ts:117](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L117)

##### getMessageEvents()

```ts
getMessageEvents(): object[]
```

Get combined data for any InboxMessageDelivered and MessageDelivered events
emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getMessageEvents`

###### Source

[message/L1Transaction.ts:138](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L138)

##### getTokenDepositEvents()

```ts
getTokenDepositEvents(): object[]
```

Get any token deposit events created by this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getTokenDepositEvents`

###### Source

[message/L1Transaction.ts:287](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L287)

##### isClassic()

```ts
isClassic<T>(l2SignerOrProvider: T): Promise<boolean>
```

Check if is a classic transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type | Description |
| :------------------- | :--- | :---------- |
| `l2SignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

`L1TransactionReceipt.isClassic`

###### Source

[message/L1Transaction.ts:105](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L105)

##### waitForL2()

```ts
waitForL2<T>(
   l2SignerOrProvider: T,
   confirmations?: number,
timeout?: number): Promise<object & L1ToL2MessageWaitResult>
```

Wait for the transaction to arrive and be executed on L2

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type     | Description                                                                                                                                                                       |
| :------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l2SignerOrProvider` | `T`      | -                                                                                                                                                                                 |
| `confirmations`?     | `number` | Amount of confirmations the retryable ticket and the auto redeem receipt should have                                                                                              |
| `timeout`?           | `number` | Amount of time to wait for the retryable ticket to be created<br />Defaults to 15 minutes, as by this time all transactions are expected to be included on L2. Throws on timeout. |

###### Returns

`Promise`\<`object` & [`L1ToL2MessageWaitResult`](L1ToL2Message.md#l1tol2messagewaitresult)\>

The wait result contains `complete`, a `status`, an L1ToL2Message and optionally the `l2TxReceipt`.
If `complete` is true then this message is in the terminal state.
For contract calls this is true only if the status is REDEEMED.

###### Source

[message/L1Transaction.ts:396](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L396)

##### monkeyPatchContractCallWait()

```ts
static monkeyPatchContractCallWait(contractTransaction: ContractTransaction): L1ContractCallTransaction
```

Replaces the wait function with one that returns an L1ContractCallTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`L1ContractCallTransaction`

###### Inherited from

`L1TransactionReceipt.monkeyPatchContractCallWait`

###### Source

[message/L1Transaction.ts:332](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L332)

##### monkeyPatchEthDepositWait()

```ts
static monkeyPatchEthDepositWait(contractTransaction: ContractTransaction): L1EthDepositTransaction
```

Replaces the wait function with one that returns an L1EthDepositTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`L1EthDepositTransaction`

###### Inherited from

`L1TransactionReceipt.monkeyPatchEthDepositWait`

###### Source

[message/L1Transaction.ts:316](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L316)

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): L1ContractTransaction<L1TransactionReceipt>
```

Replaces the wait function with one that returns an L1TransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`L1ContractTransaction`\<`L1TransactionReceipt`\>

###### Inherited from

`L1TransactionReceipt.monkeyPatchWait`

###### Source

[message/L1Transaction.ts:300](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L300)

---

### L1EthDepositTransactionReceipt

An L1TransactionReceipt with additional functionality that only exists
if the transaction created a single eth deposit.

#### Extends

- `L1TransactionReceipt`

#### Methods

##### getEthDeposits()

```ts
getEthDeposits(l2Provider: Provider): Promise<EthDepositMessage[]>
```

Get any eth deposit messages created by this transaction

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l2Provider` | `Provider` |

###### Returns

`Promise` \<[`EthDepositMessage`](L1ToL2Message.md#ethdepositmessage)[]\>

###### Inherited from

`L1TransactionReceipt.getEthDeposits`

###### Source

[message/L1Transaction.ts:182](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L182)

##### getInboxMessageDeliveredEvents()

```ts
getInboxMessageDeliveredEvents(): object[]
```

Get any InboxMessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getInboxMessageDeliveredEvents`

###### Source

[message/L1Transaction.ts:125](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L125)

##### getL1ToL2Messages()

```ts
getL1ToL2Messages<T>(l2SignerOrProvider: T): Promise<L1ToL2MessageReaderOrWriter<T>[]>
```

Get any l1tol2 messages created by this transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type | Description |
| :------------------- | :--- | :---------- |
| `l2SignerOrProvider` | `T`  |             |

###### Returns

`Promise` \<[`L1ToL2MessageReaderOrWriter`](L1ToL2Message.md#l1tol2messagereaderorwritert)\<`T`\>[]\>

###### Inherited from

`L1TransactionReceipt.getL1ToL2Messages`

###### Source

[message/L1Transaction.ts:239](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L239)

##### getL1ToL2MessagesClassic()

```ts
getL1ToL2MessagesClassic(l2Provider: Provider): Promise<L1ToL2MessageReaderClassic[]>
```

Get classic l1tol2 messages created by this transaction

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise`\<`L1ToL2MessageReaderClassic`[]\>

###### Inherited from

`L1TransactionReceipt.getL1ToL2MessagesClassic`

###### Source

[message/L1Transaction.ts:207](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L207)

##### getMessageDeliveredEvents()

```ts
getMessageDeliveredEvents(): object[]
```

Get any MessageDelivered events that were emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getMessageDeliveredEvents`

###### Source

[message/L1Transaction.ts:117](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L117)

##### getMessageEvents()

```ts
getMessageEvents(): object[]
```

Get combined data for any InboxMessageDelivered and MessageDelivered events
emitted during this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getMessageEvents`

###### Source

[message/L1Transaction.ts:138](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L138)

##### getTokenDepositEvents()

```ts
getTokenDepositEvents(): object[]
```

Get any token deposit events created by this transaction

###### Returns

`object`[]

###### Inherited from

`L1TransactionReceipt.getTokenDepositEvents`

###### Source

[message/L1Transaction.ts:287](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L287)

##### isClassic()

```ts
isClassic<T>(l2SignerOrProvider: T): Promise<boolean>
```

Check if is a classic transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type | Description |
| :------------------- | :--- | :---------- |
| `l2SignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

`L1TransactionReceipt.isClassic`

###### Source

[message/L1Transaction.ts:105](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L105)

##### waitForL2()

```ts
waitForL2(
   l2Provider: Provider,
   confirmations?: number,
timeout?: number): Promise<object & EthDepositMessageWaitResult>
```

Wait for the funds to arrive on L2

###### Parameters

| Parameter        | Type       | Description                                                                                                                                                                       |
| :--------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l2Provider`     | `Provider` | -                                                                                                                                                                                 |
| `confirmations`? | `number`   | Amount of confirmations the retryable ticket and the auto redeem receipt should have                                                                                              |
| `timeout`?       | `number`   | Amount of time to wait for the retryable ticket to be created<br />Defaults to 15 minutes, as by this time all transactions are expected to be included on L2. Throws on timeout. |

###### Returns

`Promise`\<`object` & `EthDepositMessageWaitResult`\>

The wait result contains `complete`, a `status`, the L1ToL2Message and optionally the `l2TxReceipt`
If `complete` is true then this message is in the terminal state.
For eth deposits complete this is when the status is FUNDS_DEPOSITED, EXPIRED or REDEEMED.

###### Source

[message/L1Transaction.ts:358](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L358)

##### monkeyPatchContractCallWait()

```ts
static monkeyPatchContractCallWait(contractTransaction: ContractTransaction): L1ContractCallTransaction
```

Replaces the wait function with one that returns an L1ContractCallTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`L1ContractCallTransaction`

###### Inherited from

`L1TransactionReceipt.monkeyPatchContractCallWait`

###### Source

[message/L1Transaction.ts:332](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L332)

##### monkeyPatchEthDepositWait()

```ts
static monkeyPatchEthDepositWait(contractTransaction: ContractTransaction): L1EthDepositTransaction
```

Replaces the wait function with one that returns an L1EthDepositTransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`L1EthDepositTransaction`

###### Inherited from

`L1TransactionReceipt.monkeyPatchEthDepositWait`

###### Source

[message/L1Transaction.ts:316](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L316)

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): L1ContractTransaction<L1TransactionReceipt>
```

Replaces the wait function with one that returns an L1TransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`L1ContractTransaction`\<`L1TransactionReceipt`\>

###### Inherited from

`L1TransactionReceipt.monkeyPatchWait`

###### Source

[message/L1Transaction.ts:300](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1Transaction.ts#L300)
