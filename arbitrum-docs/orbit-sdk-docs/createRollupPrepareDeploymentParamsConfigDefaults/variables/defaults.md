---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Variable: defaults

> `const` **defaults**: `object`

defaults defines the default values for various parameters used in the
preparation of deployment configuration. It includes
extraChallengeTimeBlocks, stakeToken, baseStake, wasmModuleRoot,
loserStakeEscrow, and genesisBlockNum.

## Type declaration

### baseStake

> `readonly` **baseStake**: `bigint`

### extraChallengeTimeBlocks

> `readonly` **extraChallengeTimeBlocks**: `bigint`

### genesisBlockNum

> `readonly` **genesisBlockNum**: `bigint`

### loserStakeEscrow

> `readonly` **loserStakeEscrow**: `"0x0000000000000000000000000000000000000000"` = `zeroAddress`

### stakeToken

> `readonly` **stakeToken**: `"0x0000000000000000000000000000000000000000"` = `zeroAddress`

### wasmModuleRoot

> **wasmModuleRoot**: \`0x$\{string\}\`

## Source

[src/createRollupPrepareDeploymentParamsConfigDefaults.ts:24](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupPrepareDeploymentParamsConfigDefaults.ts#L24)
