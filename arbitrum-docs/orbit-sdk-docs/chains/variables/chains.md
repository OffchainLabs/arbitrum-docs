---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Variable: chains

> `const` **chains**: readonly [`Assign`\<`object`, `ChainConfig`\<`undefined`\>\>, `Assign`\<`object`, `ChainConfig`\<`undefined`\>\>, `Assign`\<`object`, `ChainConfig`\<`undefined`\>\>, `Assign`\<`object`, `ChainConfig`\<`undefined`\>\>, `Assign`\<`object`, `ChainConfig`\<`undefined`\>\>, `Assign`\<`object`, `ChainConfig`\<`undefined`\>\>, `any`, `any`, `any`]

The `chains` variable contains an array of various blockchain configurations,
including mainnet, testnet, and local nitro-testnode chains. Each chain
object includes information such as network name, native currency details,
RPC URLs, and testnet status. It provides a convenient way to access and
reference different blockchain configurations within the application.

## Source

[src/chains.ts:67](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/chains.ts#L67)
