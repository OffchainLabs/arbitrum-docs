---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareConfig

## Type Aliases

### CreateRollupPrepareConfigParams

> **CreateRollupPrepareConfigParams**: [`Prettify`](types/utils.md#prettifyt)\<`RequiredParams` & `object` & `OptionalParams`\>

#### Source

[createRollupPrepareConfig.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareConfig.ts#L15)

***

### CreateRollupPrepareConfigResult

> **CreateRollupPrepareConfigResult**: [`CreateRollupFunctionInputs`](types/createRollupTypes.md#createrollupfunctioninputs)\[`0`\]\[`"config"`\]

#### Source

[createRollupPrepareConfig.ts:9](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareConfig.ts#L9)

## Variables

### defaults

> `const` **defaults**: `object`

#### Type declaration

##### baseStake

> `readonly` **baseStake**: `any`

##### confirmPeriodBlocks

> `readonly` **confirmPeriodBlocks**: `bigint`

##### extraChallengeTimeBlocks

> `readonly` **extraChallengeTimeBlocks**: `bigint`

##### genesisBlockNum

> `readonly` **genesisBlockNum**: `bigint`

##### loserStakeEscrow

> `readonly` **loserStakeEscrow**: `any` = `zeroAddress`

##### sequencerInboxMaxTimeVariation

> `readonly` **sequencerInboxMaxTimeVariation**: `object`

##### sequencerInboxMaxTimeVariation.delayBlocks

> `readonly` **delayBlocks**: `bigint`

##### sequencerInboxMaxTimeVariation.delaySeconds

> `readonly` **delaySeconds**: `bigint`

##### sequencerInboxMaxTimeVariation.futureBlocks

> `readonly` **futureBlocks**: `bigint`

##### sequencerInboxMaxTimeVariation.futureSeconds

> `readonly` **futureSeconds**: `bigint`

##### stakeToken

> `readonly` **stakeToken**: `any` = `zeroAddress`

##### wasmModuleRoot

> **wasmModuleRoot**: \`0x$\{string\}\`

#### Source

[createRollupPrepareConfig.ts:19](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareConfig.ts#L19)

## Functions

### ~~createRollupPrepareConfig()~~

> **createRollupPrepareConfig**(`__namedParameters`): [`CreateRollupPrepareConfigResult`](createRollupPrepareConfig.md#createrollupprepareconfigresult)

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.chainConfig?**: [`ChainConfig`](types/ChainConfig.md#chainconfig)

• **\_\_namedParameters.chainId**: `GetFunctionArgs`\<readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`], `"createRollup"`\>

• **\_\_namedParameters.owner**: `GetFunctionArgs`\<readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`], `"createRollup"`\>

#### Returns

[`CreateRollupPrepareConfigResult`](createRollupPrepareConfig.md#createrollupprepareconfigresult)

#### Deprecated

Will be removed in a future release. Please use [createRollupPrepareDeploymentParamsConfig](createRollupPrepareDeploymentParamsConfig.md#createrolluppreparedeploymentparamsconfig) instead.

#### Source

[createRollupPrepareConfig.ts:33](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareConfig.ts#L33)
