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

[message/L1ToL2MessageGasEstimator.ts:38](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2MessageGasEstimator.ts#L38)
