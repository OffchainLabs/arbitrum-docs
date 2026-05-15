## Classes

### EthDepositMessage

Defined in: message/ParentToChildMessage.ts:760

A message for Eth deposits from Parent to Child

#### Constructors

##### Constructor

```ts
new EthDepositMessage(
   childProvider: Provider,
   childChainId: number,
   messageNumber: BigNumber,
   from: string,
   to: string,
   value: BigNumber): EthDepositMessage;
```

Defined in: message/ParentToChildMessage.ts:852

###### Parameters

| Parameter       | Type        | Description                           |
| --------------- | ----------- | ------------------------------------- |
| `childProvider` | `Provider`  |                                       |
| `childChainId`  | `number`    |                                       |
| `messageNumber` | `BigNumber` |                                       |
| `from`          | `string`    | -                                     |
| `to`            | `string`    | Recipient address of the ETH on Chain |
| `value`         | `BigNumber` |                                       |

###### Returns

[`EthDepositMessage`](#ethdepositmessage)

#### Properties

| Property                                   | Modifier   | Type        | Description                           | Defined in                          |
| ------------------------------------------ | ---------- | ----------- | ------------------------------------- | ----------------------------------- |
| <a id="childchainid"></a> `childChainId`   | `readonly` | `number`    | -                                     | message/ParentToChildMessage.ts:854 |
| <a id="messagenumber"></a> `messageNumber` | `readonly` | `BigNumber` | -                                     | message/ParentToChildMessage.ts:855 |
| <a id="to"></a> `to`                       | `readonly` | `string`    | Recipient address of the ETH on Chain | message/ParentToChildMessage.ts:857 |
| <a id="value"></a> `value`                 | `readonly` | `BigNumber` | -                                     | message/ParentToChildMessage.ts:858 |

#### Methods

##### fromEventComponents()

```ts
static fromEventComponents(
   childProvider: Provider,
   messageNumber: BigNumber,
   senderAddr: string,
inboxMessageEventData: string): Promise<EthDepositMessage>;
```

Defined in: message/ParentToChildMessage.ts:823

Create an EthDepositMessage from data emitted in event when calling ethDeposit on Inbox.sol

###### Parameters

| Parameter               | Type        | Description                                                 |
| ----------------------- | ----------- | ----------------------------------------------------------- |
| `childProvider`         | `Provider`  |                                                             |
| `messageNumber`         | `BigNumber` | The message number in the Inbox.InboxMessageDelivered event |
| `senderAddr`            | `string`    | The sender address from Bridge.MessageDelivered event       |
| `inboxMessageEventData` | `string`    | The data field from the Inbox.InboxMessageDelivered event   |

###### Returns

`Promise`\<[`EthDepositMessage`](#ethdepositmessage)\>

## Type Aliases

### ParentToChildMessageReaderOrWriter

```ts
type ParentToChildMessageReaderOrWriter<T> = T extends Provider
  ? ParentToChildMessageReader
  : ParentToChildMessageWriter;
```

Defined in: message/ParentToChildMessage.ts:98

Conditional type for Signer or Provider. If T is of type Provider
then ParentToChildMessageReaderOrWriter\<T\> will be of type ParentToChildMessageReader.
If T is of type Signer then ParentToChildMessageReaderOrWriter\<T\> will be of
type ParentToChildMessageWriter.

#### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `T` _extends_ `SignerOrProvider` |

---

### ParentToChildMessageWaitForStatusResult

```ts
type ParentToChildMessageWaitForStatusResult =
  | {
      childTxReceipt: TransactionReceipt;
      status: ParentToChildMessageStatus.REDEEMED;
    }
  | {
      status: Exclude<ParentToChildMessageStatus, ParentToChildMessageStatus.REDEEMED>;
    };
```

Defined in: message/ParentToChildMessage.ts:240

If the status is redeemed, childTxReceipt is populated.
For all other statuses childTxReceipt is not populated
