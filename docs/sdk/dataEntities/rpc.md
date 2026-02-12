---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### ArbTransactionReceipt

Defined in: [dataEntities/rpc.ts:28](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/rpc.ts#L28)

Eth transaction receipt with additional arbitrum specific fields

#### Extends

- `TransactionReceipt`

#### Properties

| Property                                   | Type        | Description                                                                                                                                                    | Defined in                                                                                                                                           |
| ------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="gasusedforl1"></a> `gasUsedForL1`   | `BigNumber` | Amount of gas spent on l1 computation in units of l2 gas                                                                                                       | [dataEntities/rpc.ts:38](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/rpc.ts#L38) |
| <a id="l1blocknumber"></a> `l1BlockNumber` | `number`    | The l1 block number that would be used for block.number calls that occur within this transaction. See https://developer.offchainlabs.com/docs/time_in_arbitrum | [dataEntities/rpc.ts:34](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/rpc.ts#L34) |
