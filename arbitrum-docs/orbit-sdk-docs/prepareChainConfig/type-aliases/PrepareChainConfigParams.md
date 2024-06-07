[Documentation](../../README.md) / [prepareChainConfig](../README.md) / PrepareChainConfigParams

```ts
type PrepareChainConfigParams: Pick<ChainConfig, "chainId"> & Partial<Omit<ChainConfig, "chainId" | "arbitrum">> & object;
```

## Type declaration

| Member     | Type                                                                                                                                                                                                                                                                               |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arbitrum` | `Pick`\<[`ChainConfigArbitrumParams`](../../types/ChainConfig/type-aliases/ChainConfigArbitrumParams.md), `"InitialChainOwner"`\> & `Partial`\<`Omit`\<[`ChainConfigArbitrumParams`](../../types/ChainConfig/type-aliases/ChainConfigArbitrumParams.md), `"InitialChainOwner"`\>\> |

## Source

[src/prepareChainConfig.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/prepareChainConfig.ts#L33)
