---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# rollupAdminLogicPrepareTransactionRequest

## Type Aliases

### RollupAdminLogicAbi

> **RollupAdminLogicAbi**: *typeof* `rollupAdminLogicABI`

#### Source

[rollupAdminLogicPrepareTransactionRequest.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicPrepareTransactionRequest.ts#L15)

***

### RollupAdminLogicFunctionName

> **RollupAdminLogicFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`RollupAdminLogicAbi`](rollupAdminLogicPrepareTransactionRequest.md#rollupadminlogicabi)\>

#### Source

[rollupAdminLogicPrepareTransactionRequest.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicPrepareTransactionRequest.ts#L16)

***

### RollupAdminLogicPrepareTransactionRequestParameters\<TFunctionName\>

> **RollupAdminLogicPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit`\<`RollupAdminLogicPrepareFunctionDataParameters`\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: [`mainnet`](chains.md#mainnet)

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](rollupAdminLogicPrepareTransactionRequest.md#rollupadminlogicfunctionname)

#### Source

[rollupAdminLogicPrepareTransactionRequest.ts:71](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicPrepareTransactionRequest.ts#L71)

## Functions

### rollupAdminLogicPrepareFunctionData()

> **rollupAdminLogicPrepareFunctionData**\<`TFunctionName`\>(`params`): `object`

#### Type parameters

• **TFunctionName** *extends* `"outbox"` \| `"rollupEventInbox"` \| `"challengeManager"` \| `"sequencerInbox"` \| `"bridge"` \| `"validatorUtils"` \| `"validatorWalletCreator"` \| `"confirmPeriodBlocks"` \| `"extraChallengeTimeBlocks"` \| `"stakeToken"` \| `"baseStake"` \| `"wasmModuleRoot"` \| `"loserStakeEscrow"` \| `"chainId"` \| `"inbox"` \| `"initialize"` \| `"_stakerMap"` \| `"amountStaked"` \| `"latestStakedNode"` \| `"currentChallenge"` \| `"isStaked"` \| `"createNitroMigrationGenesis"` \| `"firstUnresolvedNode"` \| `"forceConfirmNode"` \| `"forceCreateNode"` \| `"forceRefundStaker"` \| `"forceResolveChallenge"` \| `"getNode"` \| `"stakerCount"` \| `"getNodeCreationBlockForLogLookup"` \| `"getStaker"` \| `"getStakerAddress"` \| `"isStakedOnLatestConfirmed"` \| `"isValidator"` \| `"isZombie"` \| `"lastStakeBlock"` \| `"latestConfirmed"` \| `"latestNodeCreated"` \| `"minimumAssertionPeriod"` \| `"nodeHasStaker"` \| `"pause"` \| `"paused"` \| `"proxiableUUID"` \| `"removeOldOutbox"` \| `"resume"` \| `"rollupDeploymentBlock"` \| `"setBaseStake"` \| `"setConfirmPeriodBlocks"` \| `"setDelayedInbox"` \| `"setExtraChallengeTimeBlocks"` \| `"setInbox"` \| `"setLoserStakeEscrow"` \| `"setMinimumAssertionPeriod"` \| `"setOutbox"` \| `"setOwner"` \| `"setSequencerInbox"` \| `"setStakeToken"` \| `"setValidator"` \| `"setValidatorWhitelistDisabled"` \| `"setWasmModuleRoot"` \| `"totalWithdrawableFunds"` \| `"upgradeBeacon"` \| `"upgradeSecondaryTo"` \| `"upgradeSecondaryToAndCall"` \| `"upgradeTo"` \| `"upgradeToAndCall"` \| `"validatorWhitelistDisabled"` \| `"withdrawableFunds"` \| `"zombieAddress"` \| `"zombieCount"` \| `"zombieLatestStakedNode"`

#### Parameters

• **params**: `any`

#### Returns

`object`

##### data

> **data**: `any`

##### to

> **to**: `any` = `params.rollup`

##### value

> **value**: `bigint`

#### Source

[rollupAdminLogicPrepareTransactionRequest.ts:41](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicPrepareTransactionRequest.ts#L41)

***

### rollupAdminLogicPrepareTransactionRequest()

> **rollupAdminLogicPrepareTransactionRequest**\<`TFunctionName`, `TTransport`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

#### Type parameters

• **TFunctionName** *extends* `"outbox"` \| `"rollupEventInbox"` \| `"challengeManager"` \| `"sequencerInbox"` \| `"bridge"` \| `"validatorUtils"` \| `"validatorWalletCreator"` \| `"confirmPeriodBlocks"` \| `"extraChallengeTimeBlocks"` \| `"stakeToken"` \| `"baseStake"` \| `"wasmModuleRoot"` \| `"loserStakeEscrow"` \| `"chainId"` \| `"inbox"` \| `"initialize"` \| `"_stakerMap"` \| `"amountStaked"` \| `"latestStakedNode"` \| `"currentChallenge"` \| `"isStaked"` \| `"createNitroMigrationGenesis"` \| `"firstUnresolvedNode"` \| `"forceConfirmNode"` \| `"forceCreateNode"` \| `"forceRefundStaker"` \| `"forceResolveChallenge"` \| `"getNode"` \| `"stakerCount"` \| `"getNodeCreationBlockForLogLookup"` \| `"getStaker"` \| `"getStakerAddress"` \| `"isStakedOnLatestConfirmed"` \| `"isValidator"` \| `"isZombie"` \| `"lastStakeBlock"` \| `"latestConfirmed"` \| `"latestNodeCreated"` \| `"minimumAssertionPeriod"` \| `"nodeHasStaker"` \| `"pause"` \| `"paused"` \| `"proxiableUUID"` \| `"removeOldOutbox"` \| `"resume"` \| `"rollupDeploymentBlock"` \| `"setBaseStake"` \| `"setConfirmPeriodBlocks"` \| `"setDelayedInbox"` \| `"setExtraChallengeTimeBlocks"` \| `"setInbox"` \| `"setLoserStakeEscrow"` \| `"setMinimumAssertionPeriod"` \| `"setOutbox"` \| `"setOwner"` \| `"setSequencerInbox"` \| `"setStakeToken"` \| `"setValidator"` \| `"setValidatorWhitelistDisabled"` \| `"setWasmModuleRoot"` \| `"totalWithdrawableFunds"` \| `"upgradeBeacon"` \| `"upgradeSecondaryTo"` \| `"upgradeSecondaryToAndCall"` \| `"upgradeTo"` \| `"upgradeToAndCall"` \| `"validatorWhitelistDisabled"` \| `"withdrawableFunds"` \| `"zombieAddress"` \| `"zombieCount"` \| `"zombieLatestStakedNode"`

• **TTransport** *extends* `Transport` = `Transport`

• **TChain** *extends* `unknown` = `any`

#### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

• **params**: [`RollupAdminLogicPrepareTransactionRequestParameters`](rollupAdminLogicPrepareTransactionRequest.md#rollupadminlogicpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

#### Returns

`Promise`\<`any`\>

#### Source

[rollupAdminLogicPrepareTransactionRequest.ts:77](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicPrepareTransactionRequest.ts#L77)
