---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareTransactionRequest(__namedParameters: object): Promise<any>
```

Creates a transaction request to prepare token bridge creation on the parent
chain. Returns the prepared transaction request along with the chain ID.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.account` | \`0x$\{string\}\` | - |
| `__namedParameters.gasOverrides`? | `TransactionRequestGasOverrides` | - |
| `__namedParameters.orbitChainPublicClient` | `object` | - |
| `__namedParameters.params` | `object` | - |
| `__namedParameters.params.rollup` | \`0x$\{string\}\` | - |
| `__namedParameters.params.rollupOwner` | \`0x$\{string\}\` | - |
| `__namedParameters.parentChainPublicClient` | `object` | - |
| `__namedParameters.retryableGasOverrides`? | `TransactionRequestRetryableGasOverrides` | - |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`any`\>

## Source

[src/createTokenBridgePrepareTransactionRequest.ts:40](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridgePrepareTransactionRequest.ts#L40)
