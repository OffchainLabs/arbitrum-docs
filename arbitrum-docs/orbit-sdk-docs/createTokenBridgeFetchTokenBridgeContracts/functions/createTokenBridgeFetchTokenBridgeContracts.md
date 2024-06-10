---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgeFetchTokenBridgeContracts(__namedParameters: object): Promise<TokenBridgeContracts>
```

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.inbox` | \`0x$\{string\}\` | - |
| `__namedParameters.parentChainPublicClient` | `object` | - |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise` \<[`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)\>

## Source

[src/createTokenBridgeFetchTokenBridgeContracts.ts:17](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridgeFetchTokenBridgeContracts.ts#L17)
