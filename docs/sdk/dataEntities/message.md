---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Enumerations

### InboxMessageKind

The inbox message kind as defined in:
https://github.com/OffchainLabs/nitro/blob/c7f3429e2456bf5ca296a49cec3bb437420bc2bb/contracts/src/libraries/MessageTypes.sol

#### Enumeration Members

| Enumeration Member                | Value |
| :-------------------------------- | :---- |
| `L1MessageType_ethDeposit`        | `12`  |
| `L1MessageType_submitRetryableTx` | `9`   |
| `L2MessageType_signedTx`          | `4`   |

## Interfaces

### RetryableMessageParams

The components of a submit retryable message. Can be parsed from the
events emitted from the Inbox.

#### Properties

| Property                 | Type        | Description                                                                      |
| :----------------------- | :---------- | :------------------------------------------------------------------------------- |
| `callValueRefundAddress` | `string`    | Address to credit l2Callvalue on L2 if retryable txn times out or gets cancelled |
| `data`                   | `string`    | Calldata for of the L2 message                                                   |
| `destAddress`            | `string`    | Destination address for L2 message                                               |
| `excessFeeRefundAddress` | `string`    | L2 address address to credit (gaslimit x gasprice - execution cost)              |
| `gasLimit`               | `BigNumber` | Max gas deducted from user's L2 balance to cover L2 execution                    |
| `l1Value`                | `BigNumber` | Value sent at L1                                                                 |
| `l2CallValue`            | `BigNumber` | Call value in L2 message                                                         |
| `maxFeePerGas`           | `BigNumber` | Gas price for L2 execution                                                       |
| `maxSubmissionFee`       | `BigNumber` | Max gas deducted from L2 balance to cover base submission fee                    |
