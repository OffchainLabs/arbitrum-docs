---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type PrepareChainConfigParams: Pick<ChainConfig, "chainId"> & Partial<Omit<ChainConfig, "chainId" | "arbitrum">> & object;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `arbitrum` | `Pick` \<[`ChainConfigArbitrumParams`](../../types/ChainConfig/type-aliases/ChainConfigArbitrumParams.md), `"InitialChainOwner"`\> & `Partial`\<`Omit` \<[`ChainConfigArbitrumParams`](../../types/ChainConfig/type-aliases/ChainConfigArbitrumParams.md), `"InitialChainOwner"`\>\> |

## Source

[src/prepareChainConfig.ts:33](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/prepareChainConfig.ts#L33)
