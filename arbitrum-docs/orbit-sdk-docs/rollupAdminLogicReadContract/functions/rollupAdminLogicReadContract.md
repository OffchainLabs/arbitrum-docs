---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: rollupAdminLogicReadContract()

> **rollupAdminLogicReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`RollupAdminLogicReadContractReturnType`](../type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\>

Reads data from the RollupAdminLogic contract on the specified rollup chain
and returns the result.

## Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the chain (or undefined)

• **TFunctionName** *extends* `"wasmModuleRoot"` \| `"chainId"` \| `"_stakerMap"` \| `"amountStaked"` \| `"latestStakedNode"` \| `"currentChallenge"` \| `"isStaked"` \| `"baseStake"` \| `"bridge"` \| `"challengeManager"` \| `"confirmPeriodBlocks"` \| `"createNitroMigrationGenesis"` \| `"extraChallengeTimeBlocks"` \| `"firstUnresolvedNode"` \| `"forceConfirmNode"` \| `"forceCreateNode"` \| `"forceRefundStaker"` \| `"forceResolveChallenge"` \| `"getNode"` \| `"stakerCount"` \| `"getNodeCreationBlockForLogLookup"` \| `"getStaker"` \| `"getStakerAddress"` \| `"inbox"` \| `"stakeToken"` \| `"loserStakeEscrow"` \| `"sequencerInbox"` \| `"outbox"` \| `"rollupEventInbox"` \| `"validatorUtils"` \| `"validatorWalletCreator"` \| `"initialize"` \| `"isStakedOnLatestConfirmed"` \| `"isValidator"` \| `"isZombie"` \| `"lastStakeBlock"` \| `"latestConfirmed"` \| `"latestNodeCreated"` \| `"minimumAssertionPeriod"` \| `"nodeHasStaker"` \| `"pause"` \| `"paused"` \| `"proxiableUUID"` \| `"removeOldOutbox"` \| `"resume"` \| `"rollupDeploymentBlock"` \| `"setBaseStake"` \| `"setConfirmPeriodBlocks"` \| `"setDelayedInbox"` \| `"setExtraChallengeTimeBlocks"` \| `"setInbox"` \| `"setLoserStakeEscrow"` \| `"setMinimumAssertionPeriod"` \| `"setOutbox"` \| `"setOwner"` \| `"setSequencerInbox"` \| `"setStakeToken"` \| `"setValidator"` \| `"setValidatorWhitelistDisabled"` \| `"setWasmModuleRoot"` \| `"totalWithdrawableFunds"` \| `"upgradeBeacon"` \| `"upgradeSecondaryTo"` \| `"upgradeSecondaryToAndCall"` \| `"upgradeTo"` \| `"upgradeToAndCall"` \| `"validatorWhitelistDisabled"` \| `"withdrawableFunds"` \| `"zombieAddress"` \| `"zombieCount"` \| `"zombieLatestStakedNode"`

The name of the function to call

## Parameters

• **client**

The public client to use for the read operation

• **params**: [`RollupAdminLogicReadContractParameters`](../type-aliases/RollupAdminLogicReadContractParameters.md)\<`TFunctionName`\>

The parameters for the read operation

## Returns

`Promise` \<[`RollupAdminLogicReadContractReturnType`](../type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\>

- The result of the read operation

## Example

```ts
const client = new PublicClient(...);
const params = {
  functionName: 'getOwner',
  rollup: '0x1234567890abcdef1234567890abcdef12345678',
  args: [],
};
const result = await rollupAdminLogicReadContract(client, params);
console.log(result);
```

## Source

[src/rollupAdminLogicReadContract.ts:60](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/rollupAdminLogicReadContract.ts#L60)
