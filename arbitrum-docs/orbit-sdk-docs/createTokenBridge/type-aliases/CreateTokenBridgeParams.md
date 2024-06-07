[Documentation](../../README.md) / [createTokenBridge](../README.md) / CreateTokenBridgeParams

```ts
type CreateTokenBridgeParams<TParentChain, TOrbitChain>: WithTokenBridgeCreatorAddressOverride<object>;
```

## Type declaration

| Member                       | Type                                                                                                                                                                |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `account`                    | `PrivateKeyAccount`                                                                                                                                                 |
| `gasOverrides`               | [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md)                                                         |
| `nativeTokenAddress`         | `Address`                                                                                                                                                           |
| `orbitChainPublicClient`     | `PublicClient`\<`Transport`, `TOrbitChain`\>                                                                                                                        |
| `parentChainPublicClient`    | `PublicClient`\<`Transport`, `TParentChain`\>                                                                                                                       |
| `retryableGasOverrides`      | [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md)               |
| `rollupAddress`              | `Address`                                                                                                                                                           |
| `rollupOwner`                | `Address`                                                                                                                                                           |
| `setWethGatewayGasOverrides` | [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareSetWethGatewayTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md) |

## Type parameters

| Type parameter                                  |
| :---------------------------------------------- |
| `TParentChain` _extends_ `Chain` \| `undefined` |
| `TOrbitChain` _extends_ `Chain` \| `undefined`  |

## Source

[src/createTokenBridge.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/createTokenBridge.ts#L41)
