---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareTransactionRequest(__namedParameters: object): Promise<any>;
```

Creates a transaction request to prepare token bridge creation on the parent
chain. Returns the prepared transaction request along with the chain ID.

## Parameters

| Parameter                                              | Type                                                                                                        | Description                                                                                                                                |
| :----------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters`                                    | `object`                                                                                                    | -                                                                                                                                          |
| `__namedParameters.account`                            | \`0x$\{string\}\`                                                                                           | -                                                                                                                                          |
| `__namedParameters.gasOverrides`?                      | [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md) | -                                                                                                                                          |
| `__namedParameters.orbitChainPublicClient`             | `object`                                                                                                    | -                                                                                                                                          |
| `__namedParameters.params`                             | `object`                                                                                                    | -                                                                                                                                          |
| `__namedParameters.params.rollup`                      | \`0x$\{string\}\`                                                                                           | -                                                                                                                                          |
| `__namedParameters.params.rollupOwner`                 | \`0x$\{string\}\`                                                                                           | -                                                                                                                                          |
| `__namedParameters.parentChainPublicClient`            | `object`                                                                                                    | -                                                                                                                                          |
| `__namedParameters.retryableGasOverrides`?             | [`TransactionRequestRetryableGasOverrides`](../type-aliases/TransactionRequestRetryableGasOverrides.md)     | -                                                                                                                                          |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\`                                                                                           | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`any`\>

## Source

[src/createTokenBridgePrepareTransactionRequest.ts:40](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgePrepareTransactionRequest.ts#L40)
