---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type CreateTokenBridgeParams: WithTokenBridgeCreatorAddressOverride<object>;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `account` | `PrivateKeyAccount` |
| `gasOverrides` | [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md) |
| `nativeTokenAddress` | `Address` |
| `orbitChainPublicClient` | `PublicClient` |
| `parentChainPublicClient` | `PublicClient` |
| `retryableGasOverrides` | [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md) |
| `rollupAddress` | `Address` |
| `rollupOwner` | `Address` |
| `setWethGatewayGasOverrides` | [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareSetWethGatewayTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md) |

## Source

[src/createTokenBridge.ts:40](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridge.ts#L40)
