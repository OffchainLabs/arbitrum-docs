---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# rollupAdminLogicPrepareTransactionRequest

## Type Aliases

### RollupAdminLogicAbi

> **RollupAdminLogicAbi**: *typeof* [`rollupAdminLogicABI`](abi/rollupAdminLogicABI.md#rollupadminlogicabi)

#### Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicPrepareTransactionRequest.ts#L15)

***

### RollupAdminLogicFunctionName

> **RollupAdminLogicFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`RollupAdminLogicAbi`](rollupAdminLogicPrepareTransactionRequest.md#rollupadminlogicabi)\>

#### Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicPrepareTransactionRequest.ts#L16)

***

### RollupAdminLogicPrepareTransactionRequestParameters\<TFunctionName\>

> **RollupAdminLogicPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit`\<`RollupAdminLogicPrepareFunctionDataParameters`\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: `Address`

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](rollupAdminLogicPrepareTransactionRequest.md#rollupadminlogicfunctionname)

#### Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:94](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicPrepareTransactionRequest.ts#L94)

## Functions

### rollupAdminLogicPrepareTransactionRequest()

> **rollupAdminLogicPrepareTransactionRequest**\<`TFunctionName`, `TTransport`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

Prepares a transaction request for a Rollup Admin Logic function to be
executed on a public client.

#### Type parameters

• **TFunctionName** *extends* `"wasmModuleRoot"` \| `"chainId"` \| `"_stakerMap"` \| `"amountStaked"` \| `"latestStakedNode"` \| `"currentChallenge"` \| `"isStaked"` \| `"baseStake"` \| `"bridge"` \| `"challengeManager"` \| `"confirmPeriodBlocks"` \| `"createNitroMigrationGenesis"` \| `"extraChallengeTimeBlocks"` \| `"firstUnresolvedNode"` \| `"forceConfirmNode"` \| `"forceCreateNode"` \| `"forceRefundStaker"` \| `"forceResolveChallenge"` \| `"getNode"` \| `"stakerCount"` \| `"getNodeCreationBlockForLogLookup"` \| `"getStaker"` \| `"getStakerAddress"` \| `"inbox"` \| `"stakeToken"` \| `"loserStakeEscrow"` \| `"sequencerInbox"` \| `"outbox"` \| `"rollupEventInbox"` \| `"validatorUtils"` \| `"validatorWalletCreator"` \| `"initialize"` \| `"isStakedOnLatestConfirmed"` \| `"isValidator"` \| `"isZombie"` \| `"lastStakeBlock"` \| `"latestConfirmed"` \| `"latestNodeCreated"` \| `"minimumAssertionPeriod"` \| `"nodeHasStaker"` \| `"pause"` \| `"paused"` \| `"proxiableUUID"` \| `"removeOldOutbox"` \| `"resume"` \| `"rollupDeploymentBlock"` \| `"setBaseStake"` \| `"setConfirmPeriodBlocks"` \| `"setDelayedInbox"` \| `"setExtraChallengeTimeBlocks"` \| `"setInbox"` \| `"setLoserStakeEscrow"` \| `"setMinimumAssertionPeriod"` \| `"setOutbox"` \| `"setOwner"` \| `"setSequencerInbox"` \| `"setStakeToken"` \| `"setValidator"` \| `"setValidatorWhitelistDisabled"` \| `"setWasmModuleRoot"` \| `"totalWithdrawableFunds"` \| `"upgradeBeacon"` \| `"upgradeSecondaryTo"` \| `"upgradeSecondaryToAndCall"` \| `"upgradeTo"` \| `"upgradeToAndCall"` \| `"validatorWhitelistDisabled"` \| `"withdrawableFunds"` \| `"zombieAddress"` \| `"zombieCount"` \| `"zombieLatestStakedNode"`

The name of the function to prepare a transaction request for.

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

The type of transport used by the public client.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of chain the public client is connected to.

#### Parameters

• **client**

The public client to execute the transaction on.

• **params**: [`RollupAdminLogicPrepareTransactionRequestParameters`](rollupAdminLogicPrepareTransactionRequest.md#rollupadminlogicpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

The parameters for preparing the transaction request.

#### Returns

`Promise`\<`any`\>

A promise that resolves to the prepared transaction request.

#### Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:116](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicPrepareTransactionRequest.ts#L116)
