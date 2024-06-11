---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridgeFetchTokenBridgeContracts()

> **createTokenBridgeFetchTokenBridgeContracts**(`createTokenBridgeFetchTokenBridgeContractsParams`): `Promise` \<[`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)\>

Creates and fetches the token bridge contracts on both the parent chain and
the orbit chain. It retrieves addresses for various contracts including
routers, gateways, WETH, proxy admin, beacon proxy factory, upgrade executor,
and multicall on both chains. Returns [TokenBridgeContracts](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md).

## Parameters

• **createTokenBridgeFetchTokenBridgeContractsParams**

The parameters for fetching token bridge contracts

• **createTokenBridgeFetchTokenBridgeContractsParams.inbox**: \`0x$\{string\}\`

The inbox address

• **createTokenBridgeFetchTokenBridgeContractsParams.parentChainPublicClient**

The parent chain public client

• **createTokenBridgeFetchTokenBridgeContractsParams.tokenBridgeCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

## Returns

`Promise` \<[`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)\>

The token bridge contracts on both chains

## Example

```ts
const contracts = await createTokenBridgeFetchTokenBridgeContracts({
  inbox: '0xYourInboxAddress',
  parentChainPublicClient: yourPublicClientInstance,
});
console.log(contracts);
```

## Source

[src/createTokenBridgeFetchTokenBridgeContracts.ts:36](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgeFetchTokenBridgeContracts.ts#L36)
