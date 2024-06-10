---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareTransactionRequest(__namedParameters: object): Promise<any>
```

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.account` | \`0x$\{string\}\` | - |
| `__namedParameters.gasOverrides`? | [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md) | - |
| `__namedParameters.orbitChainPublicClient` | `object` | - |
| `__namedParameters.params` | `object` | - |
| `__namedParameters.params.rollup` | \`0x$\{string\}\` | - |
| `__namedParameters.params.rollupOwner` | \`0x$\{string\}\` | - |
| `__namedParameters.parentChainPublicClient` | `object` | - |
| `__namedParameters.retryableGasOverrides`? | [`TransactionRequestRetryableGasOverrides`](../type-aliases/TransactionRequestRetryableGasOverrides.md) | - |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`any`\>

## Source

[src/createTokenBridgePrepareTransactionRequest.ts:36](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridgePrepareTransactionRequest.ts#L36)
