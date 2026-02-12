---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Type Aliases

### PercentIncrease

```ts
type PercentIncrease = object;
```

Defined in: [message/ParentToChildMessageGasEstimator.ts:43](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageGasEstimator.ts#L43)

An optional big number percentage increase

#### Properties

| Property                                          | Type        | Description                                                                    | Defined in                                                                                                                                                                                           |
| ------------------------------------------------- | ----------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="base"></a> `base?`                         | `BigNumber` | If provided, will override the estimated base                                  | [message/ParentToChildMessageGasEstimator.ts:47](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageGasEstimator.ts#L47) |
| <a id="percentincrease-1"></a> `percentIncrease?` | `BigNumber` | How much to increase the base by. If not provided system defaults may be used. | [message/ParentToChildMessageGasEstimator.ts:52](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageGasEstimator.ts#L52) |
