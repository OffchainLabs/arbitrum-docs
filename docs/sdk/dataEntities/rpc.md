---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### ArbTransactionReceipt

Eth transaction receipt with additional arbitrum specific fields

#### Extends

- `TransactionReceipt`

#### Properties

| Property        | Type        | Description                                                                                                                                                              |
| :-------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gasUsedForL1`  | `BigNumber` | Amount of gas spent on l1 computation in units of l2 gas                                                                                                                 |
| `l1BlockNumber` | `number`    | The l1 block number that would be used for block.number calls<br />that occur within this transaction.<br />See https://developer.offchainlabs.com/docs/time_in_arbitrum |
