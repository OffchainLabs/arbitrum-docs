---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
const defaults: object;
```

defaults defines the default values for various parameters used in the
preparation of deployment configuration. It includes
extraChallengeTimeBlocks, stakeToken, baseStake, wasmModuleRoot,
loserStakeEscrow, and genesisBlockNum.

## Type declaration

| Member | Type | Value |
| :------ | :------ | :------ |
| `baseStake` | `bigint` | ... |
| `extraChallengeTimeBlocks` | `bigint` | ... |
| `genesisBlockNum` | `bigint` | ... |
| `loserStakeEscrow` | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `stakeToken` | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `wasmModuleRoot` | \`0x$\{string\}\` | - |

## Source

[src/createRollupPrepareDeploymentParamsConfigDefaults.ts:17](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupPrepareDeploymentParamsConfigDefaults.ts#L17)
