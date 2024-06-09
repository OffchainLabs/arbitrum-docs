---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type TransactionRequestRetryableGasOverrides: object;
```

## Type declaration

| Member              | Type                                                                                |
| :------------------ | :---------------------------------------------------------------------------------- |
| `gasLimit`          | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxFeePerGas`      | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxSubmissionCost` | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |

## Source

[src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:15](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L15)
