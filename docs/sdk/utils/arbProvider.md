---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ArbitrumProvider

Defined in: [utils/arbProvider.ts:69](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/arbProvider.ts#L69)

Arbitrum specific formats

#### Extends

- `Web3Provider`

#### Constructors

##### Constructor

```ts
new ArbitrumProvider(provider: JsonRpcProvider, network?: Networkish): ArbitrumProvider;
```

Defined in: [utils/arbProvider.ts:77](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/arbProvider.ts#L77)

Arbitrum specific formats

###### Parameters

| Parameter  | Type              | Description                              |
| ---------- | ----------------- | ---------------------------------------- |
| `provider` | `JsonRpcProvider` | Must be connected to an Arbitrum network |
| `network?` | `Networkish`      | Must be an Arbitrum network              |

###### Returns

[`ArbitrumProvider`](#arbitrumprovider)

###### Overrides

```ts
Web3Provider.constructor;
```
