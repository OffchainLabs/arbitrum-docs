---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Type Aliases

### PercentIncrease

```ts
type PercentIncrease: object;
```

An optional big number percentage increase

#### Type declaration

| Member            | Type        | Description                                                                    |
| :---------------- | :---------- | :----------------------------------------------------------------------------- |
| `base`            | `BigNumber` | If provided, will override the estimated base                                  |
| `percentIncrease` | `BigNumber` | How much to increase the base by. If not provided system defaults may be used. |

#### Source

[message/ParentToChildMessageGasEstimator.ts:43](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageGasEstimator.ts#L43)
