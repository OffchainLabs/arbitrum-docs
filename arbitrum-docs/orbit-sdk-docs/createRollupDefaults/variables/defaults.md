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

| Member | Type | Value |
| :------ | :------ | :------ |
| `deployFactoriesToL2` | `boolean` | true |
| `maxFeePerGasForRetryables` | `bigint` | ... |
| `nativeToken` | `"0x0000000000000000000000000000000000000000"` | zeroAddress |

## Source

[src/createRollupDefaults.ts:8](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupDefaults.ts#L8)
