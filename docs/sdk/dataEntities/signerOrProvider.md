---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### SignerProviderUtils

Defined in: [dataEntities/signerOrProvider.ts:11](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/signerOrProvider.ts#L11)

Utility functions for signer/provider union types

#### Methods

##### checkNetworkMatches()

```ts
static checkNetworkMatches(signerOrProvider: SignerOrProvider, chainId: number): Promise<void>;
```

Defined in: [dataEntities/signerOrProvider.ts:56](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/signerOrProvider.ts#L56)

Checks that the signer/provider that's provider matches the chain id
Throws if not.

###### Parameters

| Parameter          | Type               | Description |
| ------------------ | ------------------ | ----------- |
| `signerOrProvider` | `SignerOrProvider` |             |
| `chainId`          | `number`           |             |

###### Returns

`Promise`\<`void`\>

##### getProvider()

```ts
static getProvider(signerOrProvider: SignerOrProvider): Provider | undefined;
```

Defined in: [dataEntities/signerOrProvider.ts:24](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/signerOrProvider.ts#L24)

If signerOrProvider is a provider then return itself.
If signerOrProvider is a signer then return signer.provider

###### Parameters

| Parameter          | Type               | Description |
| ------------------ | ------------------ | ----------- |
| `signerOrProvider` | `SignerOrProvider` |             |

###### Returns

`Provider` \| `undefined`

##### signerHasProvider()

```ts
static signerHasProvider(signer: Signer): signer is Signer & { provider: Provider };
```

Defined in: [dataEntities/signerOrProvider.ts:44](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/signerOrProvider.ts#L44)

Check if the signer has a connected provider

###### Parameters

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `signer`  | `Signer` |             |

###### Returns

`signer is Signer & { provider: Provider }`
