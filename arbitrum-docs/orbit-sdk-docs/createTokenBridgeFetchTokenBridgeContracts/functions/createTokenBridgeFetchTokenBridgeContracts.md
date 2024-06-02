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

[src/createTokenBridgeFetchTokenBridgeContracts.ts:23](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridgeFetchTokenBridgeContracts.ts#L23)
