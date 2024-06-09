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

[src/createTokenBridgePrepareTransactionRequest.ts:17](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgePrepareTransactionRequest.ts#L17)
