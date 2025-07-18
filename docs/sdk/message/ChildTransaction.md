---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ChildTransactionReceipt

Extension of ethers-js TransactionReceipt, adding Arbitrum-specific functionality

#### Implements

- `TransactionReceipt`

#### Methods

##### getBatchConfirmations()

```ts
getBatchConfirmations(childProvider: JsonRpcProvider): Promise<BigNumber>
```

Get number of parent chain confirmations that the batch including this tx has

###### Parameters

| Parameter       | Type              | Description |
| :-------------- | :---------------- | :---------- |
| `childProvider` | `JsonRpcProvider` |             |

###### Returns

`Promise`\<`BigNumber`\>

number of confirmations of batch including tx, or 0 if no batch included this tx

###### Source

[message/ChildTransaction.ts:138](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L138)

##### getBatchNumber()

```ts
getBatchNumber(childProvider: JsonRpcProvider): Promise<BigNumber>
```

Get the number of the batch that included this tx (will throw if no such batch exists)

###### Parameters

| Parameter       | Type              | Description |
| :-------------- | :---------------- | :---------- |
| `childProvider` | `JsonRpcProvider` |             |

###### Returns

`Promise`\<`BigNumber`\>

number of batch in which tx was included, or errors if no batch includes the current tx

###### Source

[message/ChildTransaction.ts:151](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L151)

##### getChildToParentEvents()

```ts
getChildToParentEvents(): ChildToParentTransactionEvent[]
```

Get ChildToParentTransactionEvent events created by this transaction

###### Returns

`ChildToParentTransactionEvent`[]

###### Source

[message/ChildTransaction.ts:97](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L97)

##### getChildToParentMessages()

```ts
getChildToParentMessages<T>(parentSignerOrProvider: T): Promise<ChildToParentMessageReaderOrWriter<T>[]>
```

Get any child-to-parent-messages created by this transaction

###### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type | Description |
| :----------------------- | :--- | :---------- |
| `parentSignerOrProvider` | `T`  |             |

###### Returns

`Promise` \<[`ChildToParentMessageReaderOrWriter`](ChildToParentMessage.md#childtoparentmessagereaderorwritert)\<`T`\>[]\>

###### Source

[message/ChildTransaction.ts:119](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L119)

##### getRedeemScheduledEvents()

```ts
getRedeemScheduledEvents(): object[]
```

Get event data for any redeems that were scheduled in this transaction

###### Returns

`object`[]

###### Source

[message/ChildTransaction.ts:111](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L111)

##### isDataAvailable()

```ts
isDataAvailable(childProvider: JsonRpcProvider, confirmations: number): Promise<boolean>
```

Whether the data associated with this transaction has been
made available on parent chain

###### Parameters

| Parameter       | Type              | Default value | Description                                                                        |
| :-------------- | :---------------- | :------------ | :--------------------------------------------------------------------------------- |
| `childProvider` | `JsonRpcProvider` | `undefined`   |                                                                                    |
| `confirmations` | `number`          | `10`          | The number of confirmations on the batch before data is to be considered available |

###### Returns

`Promise`\<`boolean`\>

###### Source

[message/ChildTransaction.ts:173](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L173)

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): ChildContractTransaction
```

Replaces the wait function with one that returns an L2TransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| :-------------------- | :-------------------- | :---------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ChildContractTransaction`

###### Source

[message/ChildTransaction.ts:187](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L187)

##### toRedeemTransaction()

```ts
static toRedeemTransaction(redeemTx: ChildContractTransaction, childProvider: Provider): RedeemTransaction
```

Adds a waitForRedeem function to a redeem transaction

###### Parameters

| Parameter       | Type                       | Description |
| :-------------- | :------------------------- | :---------- |
| `redeemTx`      | `ChildContractTransaction` |             |
| `childProvider` | `Provider`                 |             |

###### Returns

`RedeemTransaction`

###### Source

[message/ChildTransaction.ts:208](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L208)
