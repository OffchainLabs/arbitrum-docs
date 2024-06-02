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

| Member                     | Type                                           | Value       |
| :------------------------- | :--------------------------------------------- | :---------- |
| `baseStake`                | `bigint`                                       | ...         |
| `extraChallengeTimeBlocks` | `bigint`                                       | ...         |
| `genesisBlockNum`          | `bigint`                                       | ...         |
| `loserStakeEscrow`         | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `stakeToken`               | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `wasmModuleRoot`           | \`0x$\{string\}\`                              | -           |

## Source

[src/createRollupPrepareDeploymentParamsConfigDefaults.ts:17](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupPrepareDeploymentParamsConfigDefaults.ts#L17)
