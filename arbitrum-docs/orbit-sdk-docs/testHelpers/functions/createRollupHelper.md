---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupHelper()

> **createRollupHelper**(`__namedParameters`): `Promise`\<`object`\>

Creates a rollup chain with specified deployment parameters and validators.

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.batchPoster**: \`0x$\{string\}\`

• **\_\_namedParameters.client**

• **\_\_namedParameters.deployer**: `PrivateKeyAccountWithPrivateKey`

• **\_\_namedParameters.nativeToken**: \`0x$\{string\}\`= `zeroAddress`

• **\_\_namedParameters.validators**: [\`0x$\{string\}\`]

## Returns

`Promise`\<`object`\>

### createRollupConfig

> **createRollupConfig**: `object`

### createRollupConfig.baseStake

> **baseStake**: `bigint`

### createRollupConfig.chainConfig

> **chainConfig**: `string`

### createRollupConfig.chainId

> **chainId**: `bigint`

### createRollupConfig.confirmPeriodBlocks

> **confirmPeriodBlocks**: `bigint`

### createRollupConfig.extraChallengeTimeBlocks

> **extraChallengeTimeBlocks**: `bigint`

### createRollupConfig.genesisBlockNum

> **genesisBlockNum**: `bigint`

### createRollupConfig.loserStakeEscrow

> **loserStakeEscrow**: \`0x$\{string\}\`

### createRollupConfig.owner

> **owner**: \`0x$\{string\}\`

### createRollupConfig.sequencerInboxMaxTimeVariation

> **sequencerInboxMaxTimeVariation**: `object`

### createRollupConfig.sequencerInboxMaxTimeVariation.delayBlocks

> **delayBlocks**: `bigint`

### createRollupConfig.sequencerInboxMaxTimeVariation.delaySeconds

> **delaySeconds**: `bigint`

### createRollupConfig.sequencerInboxMaxTimeVariation.futureBlocks

> **futureBlocks**: `bigint`

### createRollupConfig.sequencerInboxMaxTimeVariation.futureSeconds

> **futureSeconds**: `bigint`

### createRollupConfig.stakeToken

> **stakeToken**: \`0x$\{string\}\`

### createRollupConfig.wasmModuleRoot

> **wasmModuleRoot**: \`0x$\{string\}\`

### createRollupInformation

> **createRollupInformation**: [`CreateRollupResults`](../../createRollup/type-aliases/CreateRollupResults.md)

## Source

[src/testHelpers.ts:148](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/testHelpers.ts#L148)
