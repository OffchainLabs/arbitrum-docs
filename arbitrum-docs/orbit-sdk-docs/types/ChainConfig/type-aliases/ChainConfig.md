[Documentation](../../../README.md) / [types/ChainConfig](../README.md) / ChainConfig

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

[src/types/ChainConfig.ts:14](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/types/ChainConfig.ts#L14)
