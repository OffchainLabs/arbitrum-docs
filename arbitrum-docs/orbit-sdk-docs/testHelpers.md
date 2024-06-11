---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# testHelpers

## Functions

### createRollupHelper()

> **createRollupHelper**(`__namedParameters`): `Promise`\<`object`\>

Creates a rollup chain with specified deployment parameters and validators.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.batchPoster**: \`0x$\{string\}\`

• **\_\_namedParameters.client**

• **\_\_namedParameters.deployer**: `PrivateKeyAccountWithPrivateKey`

• **\_\_namedParameters.nativeToken**: \`0x$\{string\}\`= `zeroAddress`

• **\_\_namedParameters.validators**: [\`0x$\{string\}\`]

#### Returns

`Promise`\<`object`\>

##### createRollupConfig

> **createRollupConfig**: `object`

##### createRollupConfig.baseStake

> **baseStake**: `bigint`

##### createRollupConfig.chainConfig

> **chainConfig**: `string`

##### createRollupConfig.chainId

> **chainId**: `bigint`

##### createRollupConfig.confirmPeriodBlocks

> **confirmPeriodBlocks**: `bigint`

##### createRollupConfig.extraChallengeTimeBlocks

> **extraChallengeTimeBlocks**: `bigint`

##### createRollupConfig.genesisBlockNum

> **genesisBlockNum**: `bigint`

##### createRollupConfig.loserStakeEscrow

> **loserStakeEscrow**: \`0x$\{string\}\`

##### createRollupConfig.owner

> **owner**: \`0x$\{string\}\`

##### createRollupConfig.sequencerInboxMaxTimeVariation

> **sequencerInboxMaxTimeVariation**: `object`

##### createRollupConfig.sequencerInboxMaxTimeVariation.delayBlocks

> **delayBlocks**: `bigint`

##### createRollupConfig.sequencerInboxMaxTimeVariation.delaySeconds

> **delaySeconds**: `bigint`

##### createRollupConfig.sequencerInboxMaxTimeVariation.futureBlocks

> **futureBlocks**: `bigint`

##### createRollupConfig.sequencerInboxMaxTimeVariation.futureSeconds

> **futureSeconds**: `bigint`

##### createRollupConfig.stakeToken

> **stakeToken**: \`0x$\{string\}\`

##### createRollupConfig.wasmModuleRoot

> **wasmModuleRoot**: \`0x$\{string\}\`

##### createRollupInformation

> **createRollupInformation**: [`CreateRollupResults`](createRollup.md#createrollupresults)

#### Source

[src/testHelpers.ts:148](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/testHelpers.ts#L148)

***

### getInformationFromTestnode()

> **getInformationFromTestnode**(): `TestnodeInformation`

Returns information about the testnode setup including addresses for the
bridge, rollup, sequencer inbox, batch poster, and more.

#### Returns

`TestnodeInformation`

#### Source

[src/testHelpers.ts:101](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/testHelpers.ts#L101)

***

### getNitroTestnodePrivateKeyAccounts()

> **getNitroTestnodePrivateKeyAccounts**(): `NitroTestNodePrivateKeyAccounts`

Returns a collection of private key accounts for the Nitro test node,
including deployer, L2 rollup owner, L3 rollup owner, L3 token bridge
deployer, and L2 token bridge deployer.

#### Returns

`NitroTestNodePrivateKeyAccounts`

#### Source

[src/testHelpers.ts:34](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/testHelpers.ts#L34)
