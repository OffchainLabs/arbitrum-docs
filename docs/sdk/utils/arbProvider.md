---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ArbitrumProvider

Arbitrum specific formats

#### Extends

- `Web3Provider`

#### Constructors

##### new ArbitrumProvider()

```ts
new ArbitrumProvider(provider: JsonRpcProvider, network?: Networkish): ArbitrumProvider
```

Arbitrum specific formats

###### Parameters

| Parameter  | Type              | Description                              |
| :--------- | :---------------- | :--------------------------------------- |
| `provider` | `JsonRpcProvider` | Must be connected to an Arbitrum network |
| `network`? | `Networkish`      | Must be an Arbitrum network              |

###### Returns

[`ArbitrumProvider`](arbProvider.md#arbitrumprovider)

###### Overrides

`Web3Provider.constructor`

###### Source

[utils/arbProvider.ts:77](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/arbProvider.ts#L77)
