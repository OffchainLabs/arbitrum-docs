---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgeFetchTokenBridgeContracts

## Type Aliases

### CreateTokenBridgeFetchTokenBridgeContractsParams

> **CreateTokenBridgeFetchTokenBridgeContractsParams**: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Source

[src/createTokenBridgeFetchTokenBridgeContracts.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgeFetchTokenBridgeContracts.ts#L10)

## Functions

### createTokenBridgeFetchTokenBridgeContracts()

> **createTokenBridgeFetchTokenBridgeContracts**(`createTokenBridgeFetchTokenBridgeContractsParams`): `Promise` \<[`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)\>

Creates and fetches the token bridge contracts on both the parent chain and
the orbit chain. It retrieves addresses for various contracts including
routers, gateways, WETH, proxy admin, beacon proxy factory, upgrade executor,
and multicall on both chains. Returns [TokenBridgeContracts](types/TokenBridgeContracts.md#tokenbridgecontracts).

#### Parameters

• **createTokenBridgeFetchTokenBridgeContractsParams**

The parameters for fetching token bridge contracts

• **createTokenBridgeFetchTokenBridgeContractsParams.inbox**: \`0x$\{string\}\`

The inbox address

• **createTokenBridgeFetchTokenBridgeContractsParams.parentChainPublicClient**

The parent chain public client

• **createTokenBridgeFetchTokenBridgeContractsParams.tokenBridgeCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise` \<[`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)\>

The token bridge contracts on both chains

#### Example

```ts
const contracts = await createTokenBridgeFetchTokenBridgeContracts({
  inbox: '0xYourInboxAddress',
  parentChainPublicClient: yourPublicClientInstance,
});
console.log(contracts);
```

#### Source

[src/createTokenBridgeFetchTokenBridgeContracts.ts:36](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgeFetchTokenBridgeContracts.ts#L36)
