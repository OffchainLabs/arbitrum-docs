---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
const chains: readonly [Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, any, any, any];
```

The `chains` variable contains an array of various blockchain configurations,
including mainnet, testnet, and local nitro-testnode chains. Each chain
object includes information such as network name, native currency details,
RPC URLs, and testnet status. It provides a convenient way to access and
reference different blockchain configurations within the application.

## Source

[src/chains.ts:67](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/chains.ts#L67)
