---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### SignerProviderUtils

Utility functions for signer/provider union types

#### Methods

##### checkNetworkMatches()

```ts
static checkNetworkMatches(signerOrProvider: SignerOrProvider, chainId: number): Promise<void>
```

Checks that the signer/provider that's provider matches the chain id
Throws if not.

###### Parameters

| Parameter          | Type               | Description |
| :----------------- | :----------------- | :---------- |
| `signerOrProvider` | `SignerOrProvider` |             |
| `chainId`          | `number`           |             |

###### Returns

`Promise`\<`void`\>

###### Source

[dataEntities/signerOrProvider.ts:56](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/signerOrProvider.ts#L56)

##### getProvider()

```ts
static getProvider(signerOrProvider: SignerOrProvider): undefined | Provider
```

If signerOrProvider is a provider then return itself.
If signerOrProvider is a signer then return signer.provider

###### Parameters

| Parameter          | Type               | Description |
| :----------------- | :----------------- | :---------- |
| `signerOrProvider` | `SignerOrProvider` |             |

###### Returns

`undefined` \| `Provider`

###### Source

[dataEntities/signerOrProvider.ts:24](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/signerOrProvider.ts#L24)

##### signerHasProvider()

```ts
static signerHasProvider(signer: Signer): signer is Signer & Object
```

Check if the signer has a connected provider

###### Parameters

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `signer`  | `Signer` |             |

###### Returns

`signer is Signer & Object`

###### Source

[dataEntities/signerOrProvider.ts:44](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/signerOrProvider.ts#L44)
