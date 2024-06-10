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

[src/prepareChainConfig.ts:41](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/prepareChainConfig.ts#L41)
