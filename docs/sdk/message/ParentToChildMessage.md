---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### EthDepositMessage

A message for Eth deposits from Parent to Child

#### Constructors

##### new EthDepositMessage()

```ts
new EthDepositMessage(
   childProvider: Provider,
   childChainId: number,
   messageNumber: BigNumber,
   from: string,
   to: string,
   value: BigNumber): EthDepositMessage
```

###### Parameters

| Parameter       | Type        | Description                           |
| :-------------- | :---------- | :------------------------------------ |
| `childProvider` | `Provider`  |                                       |
| `childChainId`  | `number`    |                                       |
| `messageNumber` | `BigNumber` |                                       |
| `from`          | `string`    | -                                     |
| `to`            | `string`    | Recipient address of the ETH on Chain |
| `value`         | `BigNumber` |                                       |

###### Returns

[`EthDepositMessage`](ParentToChildMessage.md#ethdepositmessage)

###### Source

[message/ParentToChildMessage.ts:852](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessage.ts#L852)

#### Properties

| Property        | Modifier   | Type        | Description                           |
| :-------------- | :--------- | :---------- | :------------------------------------ |
| `childChainId`  | `readonly` | `number`    | -                                     |
| `childProvider` | `private`  | `Provider`  | -                                     |
| `messageNumber` | `readonly` | `BigNumber` | -                                     |
| `to`            | `readonly` | `string`    | Recipient address of the ETH on Chain |
| `value`         | `readonly` | `BigNumber` | -                                     |

#### Methods

##### fromEventComponents()

```ts
static fromEventComponents(
   childProvider: Provider,
   messageNumber: BigNumber,
   senderAddr: string,
inboxMessageEventData: string): Promise<EthDepositMessage>
```

Create an EthDepositMessage from data emitted in event when calling ethDeposit on Inbox.sol

###### Parameters

| Parameter               | Type        | Description                                                 |
| :---------------------- | :---------- | :---------------------------------------------------------- |
| `childProvider`         | `Provider`  |                                                             |
| `messageNumber`         | `BigNumber` | The message number in the Inbox.InboxMessageDelivered event |
| `senderAddr`            | `string`    | The sender address from Bridge.MessageDelivered event       |
| `inboxMessageEventData` | `string`    | The data field from the Inbox.InboxMessageDelivered event   |

###### Returns

`Promise` \<[`EthDepositMessage`](ParentToChildMessage.md#ethdepositmessage)\>

###### Source

[message/ParentToChildMessage.ts:823](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessage.ts#L823)

##### parseEthDepositData()

```ts
static private parseEthDepositData(eventData: string): object
```

Parse the data field in
event InboxMessageDelivered(uint256 indexed messageNum, bytes data);

###### Parameters

| Parameter   | Type     | Description |
| :---------- | :------- | :---------- |
| `eventData` | `string` |             |

###### Returns

`object`

destination and amount

| Member  | Type        |
| :------ | :---------- |
| `to`    | `string`    |
| `value` | `BigNumber` |

###### Source

[message/ParentToChildMessage.ts:802](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessage.ts#L802)

## Type Aliases

### ParentToChildMessageReaderOrWriter\<T\>

```ts
type ParentToChildMessageReaderOrWriter<T>: T extends Provider ? ParentToChildMessageReader : ParentToChildMessageWriter;
```

Conditional type for Signer or Provider. If T is of type Provider
then ParentToChildMessageReaderOrWriter\<T\> will be of type ParentToChildMessageReader.
If T is of type Signer then ParentToChildMessageReaderOrWriter\<T\> will be of
type ParentToChildMessageWriter.

#### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

#### Source

[message/ParentToChildMessage.ts:98](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessage.ts#L98)

---

### ParentToChildMessageWaitForStatusResult

```ts
type ParentToChildMessageWaitForStatusResult: object | object;
```

If the status is redeemed, childTxReceipt is populated.
For all other statuses childTxReceipt is not populated

#### Source

[message/ParentToChildMessage.ts:240](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessage.ts#L240)
