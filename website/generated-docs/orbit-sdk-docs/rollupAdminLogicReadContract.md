---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# rollupAdminLogicReadContract

## Type Aliases

### RollupAdminLogicAbi

> **RollupAdminLogicAbi**: *typeof* `rollupAdminLogicABI`

#### Source

[rollupAdminLogicReadContract.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicReadContract.ts#L15)

***

### RollupAdminLogicFunctionName

> **RollupAdminLogicFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`RollupAdminLogicAbi`](rollupAdminLogicReadContract.md#rollupadminlogicabi)\>

#### Source

[rollupAdminLogicReadContract.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicReadContract.ts#L16)

***

### RollupAdminLogicReadContractParameters\<TFunctionName\>

> **RollupAdminLogicReadContractParameters**\<`TFunctionName`\>: `object` & [`mainnet`](chains.md#mainnet) \<[`RollupAdminLogicAbi`](rollupAdminLogicReadContract.md#rollupadminlogicabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

##### rollup

> **rollup**: [`mainnet`](chains.md#mainnet)

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

#### Source

[rollupAdminLogicReadContract.ts:18](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicReadContract.ts#L18)

***

### RollupAdminLogicReadContractReturnType\<TFunctionName\>

> **RollupAdminLogicReadContractReturnType**\<`TFunctionName`\>: [`mainnet`](chains.md#mainnet) \<[`RollupAdminLogicAbi`](rollupAdminLogicReadContract.md#rollupadminlogicabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

#### Source

[rollupAdminLogicReadContract.ts:25](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicReadContract.ts#L25)

## Functions

### rollupAdminLogicReadContract()

> **rollupAdminLogicReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`RollupAdminLogicReadContractReturnType`](rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Type parameters

• **TChain** *extends* `unknown`

• **TFunctionName** *extends* `"outbox"` \| `"rollupEventInbox"` \| `"challengeManager"` \| `"sequencerInbox"` \| `"bridge"` \| `"validatorUtils"` \| `"validatorWalletCreator"` \| `"confirmPeriodBlocks"` \| `"extraChallengeTimeBlocks"` \| `"stakeToken"` \| `"baseStake"` \| `"wasmModuleRoot"` \| `"loserStakeEscrow"` \| `"chainId"` \| `"inbox"` \| `"initialize"` \| `"_stakerMap"` \| `"amountStaked"` \| `"latestStakedNode"` \| `"currentChallenge"` \| `"isStaked"` \| `"createNitroMigrationGenesis"` \| `"firstUnresolvedNode"` \| `"forceConfirmNode"` \| `"forceCreateNode"` \| `"forceRefundStaker"` \| `"forceResolveChallenge"` \| `"getNode"` \| `"stakerCount"` \| `"getNodeCreationBlockForLogLookup"` \| `"getStaker"` \| `"getStakerAddress"` \| `"isStakedOnLatestConfirmed"` \| `"isValidator"` \| `"isZombie"` \| `"lastStakeBlock"` \| `"latestConfirmed"` \| `"latestNodeCreated"` \| `"minimumAssertionPeriod"` \| `"nodeHasStaker"` \| `"pause"` \| `"paused"` \| `"proxiableUUID"` \| `"removeOldOutbox"` \| `"resume"` \| `"rollupDeploymentBlock"` \| `"setBaseStake"` \| `"setConfirmPeriodBlocks"` \| `"setDelayedInbox"` \| `"setExtraChallengeTimeBlocks"` \| `"setInbox"` \| `"setLoserStakeEscrow"` \| `"setMinimumAssertionPeriod"` \| `"setOutbox"` \| `"setOwner"` \| `"setSequencerInbox"` \| `"setStakeToken"` \| `"setValidator"` \| `"setValidatorWhitelistDisabled"` \| `"setWasmModuleRoot"` \| `"totalWithdrawableFunds"` \| `"upgradeBeacon"` \| `"upgradeSecondaryTo"` \| `"upgradeSecondaryToAndCall"` \| `"upgradeTo"` \| `"upgradeToAndCall"` \| `"validatorWhitelistDisabled"` \| `"withdrawableFunds"` \| `"zombieAddress"` \| `"zombieCount"` \| `"zombieLatestStakedNode"`

#### Parameters

• **client**: `PublicClient`\<`Transport`, `TChain`\>

• **params**: `any`

#### Returns

`Promise` \<[`RollupAdminLogicReadContractReturnType`](rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[rollupAdminLogicReadContract.ts:29](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/rollupAdminLogicReadContract.ts#L29)
