---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Enumerations

### InboxMessageKind

Defined in: [dataEntities/message.ts:50](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L50)

The inbox message kind as defined in:
https://github.com/OffchainLabs/nitro/blob/c7f3429e2456bf5ca296a49cec3bb437420bc2bb/contracts/src/libraries/MessageTypes.sol

#### Enumeration Members

| Enumeration Member                                                             | Value | Defined in                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="l1messagetype_ethdeposit"></a> `L1MessageType_ethDeposit`               | `12`  | [dataEntities/message.ts:52](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L52) |
| <a id="l1messagetype_submitretryabletx"></a> `L1MessageType_submitRetryableTx` | `9`   | [dataEntities/message.ts:51](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L51) |
| <a id="l2messagetype_signedtx"></a> `L2MessageType_signedTx`                   | `4`   | [dataEntities/message.ts:53](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L53) |

## Interfaces

### RetryableMessageParams

Defined in: [dataEntities/message.ts:7](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L7)

The components of a submit retryable message. Can be parsed from the
events emitted from the Inbox.

#### Properties

| Property                                                     | Type        | Description                                                                      | Defined in                                                                                                                                                   |
| ------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="callvaluerefundaddress"></a> `callValueRefundAddress` | `string`    | Address to credit l2Callvalue on L2 if retryable txn times out or gets cancelled | [dataEntities/message.ts:31](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L31) |
| <a id="data"></a> `data`                                     | `string`    | Calldata for of the L2 message                                                   | [dataEntities/message.ts:43](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L43) |
| <a id="destaddress"></a> `destAddress`                       | `string`    | Destination address for L2 message                                               | [dataEntities/message.ts:11](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L11) |
| <a id="excessfeerefundaddress"></a> `excessFeeRefundAddress` | `string`    | L2 address address to credit (gaslimit x gasprice - execution cost)              | [dataEntities/message.ts:27](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L27) |
| <a id="gaslimit"></a> `gasLimit`                             | `BigNumber` | Max gas deducted from user's L2 balance to cover L2 execution                    | [dataEntities/message.ts:35](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L35) |
| <a id="l1value"></a> `l1Value`                               | `BigNumber` | Value sent at L1                                                                 | [dataEntities/message.ts:19](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L19) |
| <a id="l2callvalue"></a> `l2CallValue`                       | `BigNumber` | Call value in L2 message                                                         | [dataEntities/message.ts:15](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L15) |
| <a id="maxfeepergas"></a> `maxFeePerGas`                     | `BigNumber` | Gas price for L2 execution                                                       | [dataEntities/message.ts:39](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L39) |
| <a id="maxsubmissionfee"></a> `maxSubmissionFee`             | `BigNumber` | Max gas deducted from L2 balance to cover base submission fee                    | [dataEntities/message.ts:23](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/message.ts#L23) |
