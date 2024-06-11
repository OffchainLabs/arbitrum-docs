---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupDefaults

## Variables

### defaults

> `const` **defaults**: `object`

The `defaults` object provides default values for various settings, including
the native token address, deployment to Layer 2, and maximum fee per gas for
retryable transactions.

#### Type declaration

##### deployFactoriesToL2

> **deployFactoriesToL2**: `boolean` = `true`

Whether to deploy factories to Layer 2. Defaults to true.

##### maxFeePerGasForRetryables

> **maxFeePerGasForRetryables**: `bigint`

The maximum fee per gas for retryable transactions. Defaults to 0.1 gwei.

##### nativeToken

> **nativeToken**: `"0x0000000000000000000000000000000000000000"` = `zeroAddress`

The address of the native token. Defaults to zero address.

#### Source

[src/createRollupDefaults.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupDefaults.ts#L8)
