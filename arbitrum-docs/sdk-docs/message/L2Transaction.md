---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### L2TransactionReceipt

Extension of ethers-js TransactionReceipt, adding Arbitrum-specific functionality

#### Implements

- `TransactionReceipt`

#### Methods

##### getBatchConfirmations()

```ts
getBatchConfirmations(l2Provider: JsonRpcProvider): Promise<BigNumber>
```

Get number of L1 confirmations that the batch including this tx has

###### Parameters

| Parameter    | Type              | Description |
| :----------- | :---------------- | :---------- |
| `l2Provider` | `JsonRpcProvider` |             |

###### Returns

`Promise`\<`BigNumber`\>

number of confirmations of batch including tx, or 0 if no batch included this tx

###### Source

[message/L2Transaction.ts:138](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L138)

##### getBatchNumber()

```ts
getBatchNumber(l2Provider: JsonRpcProvider): Promise<BigNumber>
```

Get the number of the batch that included this tx (will throw if no such batch exists)

###### Parameters

| Parameter    | Type              | Description |
| :----------- | :---------------- | :---------- |
| `l2Provider` | `JsonRpcProvider` |             |

###### Returns

`Promise`\<`BigNumber`\>

number of batch in which tx was included, or errors if no batch includes the current tx

###### Source

[message/L2Transaction.ts:151](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L151)

##### getL2ToL1Events()

```ts
getL2ToL1Events(): L2ToL1TransactionEvent[]
```

Get an L2ToL1TxEvent events created by this transaction

###### Returns

`L2ToL1TransactionEvent`[]

###### Source

[message/L2Transaction.ts:97](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L97)

##### getL2ToL1Messages()

```ts
getL2ToL1Messages<T>(l1SignerOrProvider: T): Promise<L2ToL1MessageReaderOrWriter<T>[]>
```

Get any l2-to-l1-messages created by this transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter            | Type |
| :------------------- | :--- |
| `l1SignerOrProvider` | `T`  |

###### Returns

`Promise` \<[`L2ToL1MessageReaderOrWriter`](L2ToL1Message.md#l2tol1messagereaderorwritert)\<`T`\>[]\>

###### Source

[message/L2Transaction.ts:119](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L119)

##### getRedeemScheduledEvents()

```ts
getRedeemScheduledEvents(): object[]
```

Get event data for any redeems that were scheduled in this transaction

###### Returns

`object`[]

###### Source

[message/L2Transaction.ts:111](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L111)

##### isDataAvailable()

```ts
isDataAvailable(l2Provider: JsonRpcProvider, confirmations: number): Promise<boolean>
```

Whether the data associated with this transaction has been
made available on L1

###### Parameters

| Parameter       | Type              | Default value | Description                                                                        |
| :-------------- | :---------------- | :------------ | :--------------------------------------------------------------------------------- |
| `l2Provider`    | `JsonRpcProvider` | `undefined`   |                                                                                    |
| `confirmations` | `number`          | `10`          | The number of confirmations on the batch before data is to be considered available |

###### Returns

`Promise`\<`boolean`\>

###### Source

[message/L2Transaction.ts:173](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L173)

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): L2ContractTransaction
```

Replaces the wait function with one that returns an L2TransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`L2ContractTransaction`

###### Source

[message/L2Transaction.ts:187](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L187)

##### toRedeemTransaction()

```ts
static toRedeemTransaction(redeemTx: L2ContractTransaction, l2Provider: Provider): RedeemTransaction
```

Adds a waitForRedeem function to a redeem transaction

###### Parameters

| Parameter    | Type                    | Description |
| :----------- | :---------------------- | :---------- |
| `redeemTx`   | `L2ContractTransaction` |             |
| `l2Provider` | `Provider`              |             |

###### Returns

`RedeemTransaction`

###### Source

[message/L2Transaction.ts:208](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L2Transaction.ts#L208)
