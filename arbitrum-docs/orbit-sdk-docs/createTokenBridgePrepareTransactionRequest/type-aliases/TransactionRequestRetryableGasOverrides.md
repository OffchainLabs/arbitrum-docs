---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type TransactionRequestRetryableGasOverrides: object;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `maxGasForContracts` | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxGasForFactory` | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxGasPrice` | `bigint` |
| `maxSubmissionCostForContracts` | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxSubmissionCostForFactory` | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |

## Source

[src/createTokenBridgePrepareTransactionRequest.ts:17](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridgePrepareTransactionRequest.ts#L17)
