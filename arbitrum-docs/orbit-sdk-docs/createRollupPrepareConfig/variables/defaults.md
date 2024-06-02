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

[src/createRollupPrepareConfig.ts:23](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupPrepareConfig.ts#L23)
