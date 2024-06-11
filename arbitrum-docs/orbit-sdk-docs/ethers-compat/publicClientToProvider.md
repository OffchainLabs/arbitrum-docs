---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# ethers-compat/publicClientToProvider

## Functions

### publicClientToProvider()

> **publicClientToProvider**(`publicClient`): `any`

Converts a Viem PublicClient to an Ethers.js StaticJsonRpcProvider.

This function takes a Viem PublicClient and transforms it into an Ethers.js
StaticJsonRpcProvider. It ensures that the chain information is defined and
constructs a network object which includes chainId, name, and optionally the
ENS registry address.

#### Parameters

• **publicClient**

The Viem PublicClient instance to convert.

#### Returns

`any`

The corresponding Ethers.js StaticJsonRpcProvider.

#### Throws

Will throw an error if the chain information is undefined.

#### Example

```ts
const viemClient = new PublicClient({
  chain: {
    id: 1,
    name: 'mainnet',
    rpcUrls: { default: { http: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'] } },
    contracts: { ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' } }
  }
});
const ethersProvider = publicClientToProvider(viemClient);
```

#### Source

[src/ethers-compat/publicClientToProvider.ts:27](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/ethers-compat/publicClientToProvider.ts#L27)
