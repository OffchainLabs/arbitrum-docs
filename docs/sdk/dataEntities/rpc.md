## Interfaces

### ArbTransactionReceipt

Defined in: dataEntities/rpc.ts:28

Eth transaction receipt with additional arbitrum specific fields

#### Extends

- `TransactionReceipt`

#### Properties

| Property                                   | Type        | Description                                                                                                                                                    | Defined in             |
| ------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| <a id="gasusedforl1"></a> `gasUsedForL1`   | `BigNumber` | Amount of gas spent on l1 computation in units of l2 gas                                                                                                       | dataEntities/rpc.ts:38 |
| <a id="l1blocknumber"></a> `l1BlockNumber` | `number`    | The l1 block number that would be used for block.number calls that occur within this transaction. See https://developer.offchainlabs.com/docs/time_in_arbitrum | dataEntities/rpc.ts:34 |
