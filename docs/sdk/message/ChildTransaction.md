---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ChildTransactionReceipt

Defined in: [message/ChildTransaction.ts:54](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L54)

Extension of ethers-js TransactionReceipt, adding Arbitrum-specific functionality

#### Implements

- `TransactionReceipt`

#### Methods

##### getBatchConfirmations()

```ts
getBatchConfirmations(childProvider: JsonRpcProvider): Promise<BigNumber>;
```

Defined in: [message/ChildTransaction.ts:138](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L138)

Get number of parent chain confirmations that the batch including this tx has

###### Parameters

| Parameter       | Type              | Description |
| --------------- | ----------------- | ----------- |
| `childProvider` | `JsonRpcProvider` |             |

###### Returns

`Promise`\<`BigNumber`\>

number of confirmations of batch including tx, or 0 if no batch included this tx

##### getBatchNumber()

```ts
getBatchNumber(childProvider: JsonRpcProvider): Promise<BigNumber>;
```

Defined in: [message/ChildTransaction.ts:151](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L151)

Get the number of the batch that included this tx (will throw if no such batch exists)

###### Parameters

| Parameter       | Type              | Description |
| --------------- | ----------------- | ----------- |
| `childProvider` | `JsonRpcProvider` |             |

###### Returns

`Promise`\<`BigNumber`\>

number of batch in which tx was included, or errors if no batch includes the current tx

##### getChildToParentEvents()

```ts
getChildToParentEvents(): ChildToParentTransactionEvent[];
```

Defined in: [message/ChildTransaction.ts:97](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L97)

Get ChildToParentTransactionEvent events created by this transaction

###### Returns

`ChildToParentTransactionEvent`[]

##### getChildToParentMessages()

```ts
getChildToParentMessages<T>(parentSignerOrProvider: T): Promise<ChildToParentMessageReaderOrWriter<T>[]>;
```

Defined in: [message/ChildTransaction.ts:119](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L119)

Get any child-to-parent-messages created by this transaction

###### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

###### Parameters

| Parameter                | Type | Description |
| ------------------------ | ---- | ----------- |
| `parentSignerOrProvider` | `T`  |             |

###### Returns

`Promise`\<[`ChildToParentMessageReaderOrWriter`](ChildToParentMessage.md#childtoparentmessagereaderorwriter)\<`T`\>[]\>

##### getRedeemScheduledEvents()

```ts
getRedeemScheduledEvents(): object[];
```

Defined in: [message/ChildTransaction.ts:111](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L111)

Get event data for any redeems that were scheduled in this transaction

###### Returns

`object`[]

##### isDataAvailable()

```ts
isDataAvailable(childProvider: JsonRpcProvider, confirmations: number): Promise<boolean>;
```

Defined in: [message/ChildTransaction.ts:173](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L173)

Whether the data associated with this transaction has been
made available on parent chain

###### Parameters

| Parameter       | Type              | Default value | Description                                                                        |
| --------------- | ----------------- | ------------- | ---------------------------------------------------------------------------------- |
| `childProvider` | `JsonRpcProvider` | `undefined`   |                                                                                    |
| `confirmations` | `number`          | `10`          | The number of confirmations on the batch before data is to be considered available |

###### Returns

`Promise`\<`boolean`\>

##### monkeyPatchWait()

```ts
static monkeyPatchWait(contractTransaction: ContractTransaction): ChildContractTransaction;
```

Defined in: [message/ChildTransaction.ts:187](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L187)

Replaces the wait function with one that returns an L2TransactionReceipt

###### Parameters

| Parameter             | Type                  | Description |
| --------------------- | --------------------- | ----------- |
| `contractTransaction` | `ContractTransaction` |             |

###### Returns

`ChildContractTransaction`

##### toRedeemTransaction()

```ts
static toRedeemTransaction(redeemTx: ChildContractTransaction, childProvider: Provider): RedeemTransaction;
```

Defined in: [message/ChildTransaction.ts:208](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ChildTransaction.ts#L208)

Adds a waitForRedeem function to a redeem transaction

###### Parameters

| Parameter       | Type                       | Description |
| --------------- | -------------------------- | ----------- |
| `redeemTx`      | `ChildContractTransaction` |             |
| `childProvider` | `Provider`                 |             |

###### Returns

`RedeemTransaction`
