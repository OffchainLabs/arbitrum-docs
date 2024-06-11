---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareDeploymentParamsConfigDefaults

## Variables

### defaults

> `const` **defaults**: `object`

defaults defines the default values for various parameters used in the
preparation of deployment configuration. It includes
extraChallengeTimeBlocks, stakeToken, baseStake, wasmModuleRoot,
loserStakeEscrow, and genesisBlockNum.

#### Type declaration

##### baseStake

> `readonly` **baseStake**: `bigint`

##### extraChallengeTimeBlocks

> `readonly` **extraChallengeTimeBlocks**: `bigint`

##### genesisBlockNum

> `readonly` **genesisBlockNum**: `bigint`

##### loserStakeEscrow

> `readonly` **loserStakeEscrow**: `"0x0000000000000000000000000000000000000000"` = `zeroAddress`

##### stakeToken

> `readonly` **stakeToken**: `"0x0000000000000000000000000000000000000000"` = `zeroAddress`

##### wasmModuleRoot

> **wasmModuleRoot**: \`0x$\{string\}\`

#### Source

[src/createRollupPrepareDeploymentParamsConfigDefaults.ts:24](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareDeploymentParamsConfigDefaults.ts#L24)

***

### wasmModuleRoot

> `const` **wasmModuleRoot**: \`0x$\{string\}\` = `'0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4'`

wasmModuleRoot is a hexadecimal string representing the root hash of a
WebAssembly module.

#### Source

[src/createRollupPrepareDeploymentParamsConfigDefaults.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareDeploymentParamsConfigDefaults.ts#L7)
