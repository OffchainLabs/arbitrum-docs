---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
const defaults: object;
```

defaults adds default values for various configuration parameters used in
creating a Rollup deployment.

## Type declaration

| Member | Type | Value |
| :------ | :------ | :------ |
| `baseStake` | `bigint` | ... |
| `confirmPeriodBlocks` | `bigint` | ... |
| `extraChallengeTimeBlocks` | `bigint` | ... |
| `genesisBlockNum` | `bigint` | ... |
| `loserStakeEscrow` | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `sequencerInboxMaxTimeVariation` | `object` | ... |
| `sequencerInboxMaxTimeVariation.delayBlocks` | `bigint` | ... |
| `sequencerInboxMaxTimeVariation.delaySeconds` | `bigint` | ... |
| `sequencerInboxMaxTimeVariation.futureBlocks` | `bigint` | ... |
| `sequencerInboxMaxTimeVariation.futureSeconds` | `bigint` | ... |
| `stakeToken` | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `wasmModuleRoot` | \`0x$\{string\}\` | - |

## Source

[src/createRollupPrepareConfig.ts:23](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupPrepareConfig.ts#L23)
