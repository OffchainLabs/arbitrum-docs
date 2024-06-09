---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ChainConfig: object;
```

## Type declaration

| Member                | Type                                                        |
| :-------------------- | :---------------------------------------------------------- |
| `arbitrum`            | [`ChainConfigArbitrumParams`](ChainConfigArbitrumParams.md) |
| `berlinBlock`         | `number`                                                    |
| `byzantiumBlock`      | `number`                                                    |
| `chainId`             | `number`                                                    |
| `clique`              | `object`                                                    |
| `clique.epoch`        | `number`                                                    |
| `clique.period`       | `number`                                                    |
| `constantinopleBlock` | `number`                                                    |
| `daoForkBlock`        | `null`                                                      |
| `daoForkSupport`      | `boolean`                                                   |
| `eip150Block`         | `number`                                                    |
| `eip150Hash`          | `string`                                                    |
| `eip155Block`         | `number`                                                    |
| `eip158Block`         | `number`                                                    |
| `homesteadBlock`      | `number`                                                    |
| `istanbulBlock`       | `number`                                                    |
| `londonBlock`         | `number`                                                    |
| `muirGlacierBlock`    | `number`                                                    |
| `petersburgBlock`     | `number`                                                    |

## Source

[src/types/ChainConfig.ts:14](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/types/ChainConfig.ts#L14)
