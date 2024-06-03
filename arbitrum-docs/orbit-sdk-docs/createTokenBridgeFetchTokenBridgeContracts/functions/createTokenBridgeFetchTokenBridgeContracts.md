---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgeFetchTokenBridgeContracts(__namedParameters: object): Promise<TokenBridgeContracts>
```

Creates and fetches the token bridge contracts on both the parent chain and
the orbit chain. It retrieves addresses for various contracts including
routers, gateways, WETH, proxy admin, beacon proxy factory, upgrade executor,
and multicall on both chains. Returns TokenBridgeContracts.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.inbox` | \`0x$\{string\}\` | - |
| `__namedParameters.parentChainPublicClient` | `object` | - |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`TokenBridgeContracts`\>

## Source

[src/createTokenBridgeFetchTokenBridgeContracts.ts:23](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgeFetchTokenBridgeContracts.ts#L23)
