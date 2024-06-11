---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: rollupAdminLogicPrepareTransactionRequest()

> **rollupAdminLogicPrepareTransactionRequest**\<`TFunctionName`, `TTransport`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

Prepares a transaction request for a Rollup Admin Logic function to be
executed on a public client.

## Type parameters

• **TFunctionName** *extends* `"wasmModuleRoot"` \| `"chainId"` \| `"_stakerMap"` \| `"amountStaked"` \| `"latestStakedNode"` \| `"currentChallenge"` \| `"isStaked"` \| `"baseStake"` \| `"bridge"` \| `"challengeManager"` \| `"confirmPeriodBlocks"` \| `"createNitroMigrationGenesis"` \| `"extraChallengeTimeBlocks"` \| `"firstUnresolvedNode"` \| `"forceConfirmNode"` \| `"forceCreateNode"` \| `"forceRefundStaker"` \| `"forceResolveChallenge"` \| `"getNode"` \| `"stakerCount"` \| `"getNodeCreationBlockForLogLookup"` \| `"getStaker"` \| `"getStakerAddress"` \| `"inbox"` \| `"stakeToken"` \| `"loserStakeEscrow"` \| `"sequencerInbox"` \| `"outbox"` \| `"rollupEventInbox"` \| `"validatorUtils"` \| `"validatorWalletCreator"` \| `"initialize"` \| `"isStakedOnLatestConfirmed"` \| `"isValidator"` \| `"isZombie"` \| `"lastStakeBlock"` \| `"latestConfirmed"` \| `"latestNodeCreated"` \| `"minimumAssertionPeriod"` \| `"nodeHasStaker"` \| `"pause"` \| `"paused"` \| `"proxiableUUID"` \| `"removeOldOutbox"` \| `"resume"` \| `"rollupDeploymentBlock"` \| `"setBaseStake"` \| `"setConfirmPeriodBlocks"` \| `"setDelayedInbox"` \| `"setExtraChallengeTimeBlocks"` \| `"setInbox"` \| `"setLoserStakeEscrow"` \| `"setMinimumAssertionPeriod"` \| `"setOutbox"` \| `"setOwner"` \| `"setSequencerInbox"` \| `"setStakeToken"` \| `"setValidator"` \| `"setValidatorWhitelistDisabled"` \| `"setWasmModuleRoot"` \| `"totalWithdrawableFunds"` \| `"upgradeBeacon"` \| `"upgradeSecondaryTo"` \| `"upgradeSecondaryToAndCall"` \| `"upgradeTo"` \| `"upgradeToAndCall"` \| `"validatorWhitelistDisabled"` \| `"withdrawableFunds"` \| `"zombieAddress"` \| `"zombieCount"` \| `"zombieLatestStakedNode"`

The name of the function to prepare a transaction request for.

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

The type of transport used by the public client.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of chain the public client is connected to.

## Parameters

• **client**

The public client to execute the transaction on.

• **params**: [`RollupAdminLogicPrepareTransactionRequestParameters`](../type-aliases/RollupAdminLogicPrepareTransactionRequestParameters.md)\<`TFunctionName`\>

The parameters for preparing the transaction request.

## Returns

`Promise`\<`any`\>

A promise that resolves to the prepared transaction request.

## Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:116](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/rollupAdminLogicPrepareTransactionRequest.ts#L116)
