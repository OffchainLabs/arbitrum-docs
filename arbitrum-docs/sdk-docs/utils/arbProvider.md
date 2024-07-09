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

[utils/arbProvider.ts:77](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/arbProvider.ts#L77)
