---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
const defaults: object;
```

The `defaults` object provides default values for various settings, including
the native token address, deployment to Layer 2, and maximum fee per gas for
retryable transactions.

## Type declaration

| Member                      | Type                                           | Value       |
| :-------------------------- | :--------------------------------------------- | :---------- |
| `deployFactoriesToL2`       | `boolean`                                      | true        |
| `maxFeePerGasForRetryables` | `bigint`                                       | ...         |
| `nativeToken`               | `"0x0000000000000000000000000000000000000000"` | zeroAddress |

## Source

[src/createRollupDefaults.ts:8](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupDefaults.ts#L8)
