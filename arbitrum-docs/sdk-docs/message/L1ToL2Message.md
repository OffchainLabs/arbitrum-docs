---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### EthDepositMessage

A message for Eth deposits from L1 to L2

#### Constructors

##### new EthDepositMessage()

```ts
new EthDepositMessage(
   l2Provider: Provider,
   l2ChainId: number,
   messageNumber: BigNumber,
   from: string,
   to: string,
   value: BigNumber): EthDepositMessage
```

###### Parameters

| Parameter       | Type        | Description                        |
| :-------------- | :---------- | :--------------------------------- |
| `l2Provider`    | `Provider`  |                                    |
| `l2ChainId`     | `number`    |                                    |
| `messageNumber` | `BigNumber` |                                    |
| `from`          | `string`    | -                                  |
| `to`            | `string`    | Recipient address of the ETH on L2 |
| `value`         | `BigNumber` |                                    |

###### Returns

[`EthDepositMessage`](L1ToL2Message.md#ethdepositmessage)

###### Source

[message/L1ToL2Message.ts:823](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2Message.ts#L823)

#### Properties

| Property        | Modifier   | Type        | Description                        |
| :-------------- | :--------- | :---------- | :--------------------------------- |
| `l2ChainId`     | `readonly` | `number`    | -                                  |
| `l2Provider`    | `private`  | `Provider`  | -                                  |
| `messageNumber` | `readonly` | `BigNumber` | -                                  |
| `to`            | `readonly` | `string`    | Recipient address of the ETH on L2 |
| `value`         | `readonly` | `BigNumber` | -                                  |

#### Methods

##### fromEventComponents()

```ts
static fromEventComponents(
   l2Provider: Provider,
   messageNumber: BigNumber,
   senderAddr: string,
inboxMessageEventData: string): Promise<EthDepositMessage>
```

Create an EthDepositMessage from data emitted in event when calling ethDeposit on Inbox.sol

###### Parameters

| Parameter               | Type        | Description                                                 |
| :---------------------- | :---------- | :---------------------------------------------------------- |
| `l2Provider`            | `Provider`  |                                                             |
| `messageNumber`         | `BigNumber` | The message number in the Inbox.InboxMessageDelivered event |
| `senderAddr`            | `string`    | The sender address from Bridge.MessageDelivered event       |
| `inboxMessageEventData` | `string`    | The data field from the Inbox.InboxMessageDelivered event   |

###### Returns

`Promise` \<[`EthDepositMessage`](L1ToL2Message.md#ethdepositmessage)\>

###### Source

[message/L1ToL2Message.ts:794](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2Message.ts#L794)

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

[message/L1ToL2Message.ts:773](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2Message.ts#L773)

## Type Aliases

### L1ToL2MessageReaderOrWriter\<T\>

```ts
type L1ToL2MessageReaderOrWriter<T>: T extends Provider ? L1ToL2MessageReader : L1ToL2MessageWriter;
```

Conditional type for Signer or Provider. If T is of type Provider
then L1ToL2MessageReaderOrWriter\<T\> will be of type L1ToL2MessageReader.
If T is of type Signer then L1ToL2MessageReaderOrWriter\<T\> will be of
type L1ToL2MessageWriter.

#### Type parameters

| Type parameter                   |
| :------------------------------- |
| `T` _extends_ `SignerOrProvider` |

#### Source

[message/L1ToL2Message.ts:94](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2Message.ts#L94)

---

### L1ToL2MessageWaitResult

```ts
type L1ToL2MessageWaitResult: object | object;
```

If the status is redeemed an l2TxReceipt is populated.
For all other statuses l2TxReceipt is not populated

#### Source

[message/L1ToL2Message.ts:236](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2Message.ts#L236)
