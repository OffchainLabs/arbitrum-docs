---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareSetWethGatewayTransactionRequest(__namedParameters: object): Promise<any>
```

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.account` | \`0x$\{string\}\` | - |
| `__namedParameters.orbitChainPublicClient` | `object` | - |
| `__namedParameters.parentChainPublicClient` | `object` | - |
| `__namedParameters.retryableGasOverrides`? | [`TransactionRequestRetryableGasOverrides`](../type-aliases/TransactionRequestRetryableGasOverrides.md) | - |
| `__namedParameters.rollup` | \`0x$\{string\}\` | - |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`any`\>

## Source

[src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:92](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L92)
