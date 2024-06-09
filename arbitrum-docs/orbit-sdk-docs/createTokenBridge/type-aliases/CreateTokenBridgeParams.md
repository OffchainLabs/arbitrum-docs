---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type CreateTokenBridgeParams: WithTokenBridgeCreatorAddressOverride<object>;
```

## Type declaration

| Member                       | Type                                                                                                                                                                |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `account`                    | `PrivateKeyAccount`                                                                                                                                                 |
| `gasOverrides`               | [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md)                                                         |
| `nativeTokenAddress`         | `Address`                                                                                                                                                           |
| `orbitChainPublicClient`     | `PublicClient`                                                                                                                                                      |
| `parentChainPublicClient`    | `PublicClient`                                                                                                                                                      |
| `retryableGasOverrides`      | [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md)               |
| `rollupAddress`              | `Address`                                                                                                                                                           |
| `rollupOwner`                | `Address`                                                                                                                                                           |
| `setWethGatewayGasOverrides` | [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareSetWethGatewayTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md) |

## Source

[src/createTokenBridge.ts:40](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridge.ts#L40)
