---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# rollupAdminLogicReadContract

## Type Aliases

### RollupAdminLogicAbi

> **RollupAdminLogicAbi**: *typeof* [`rollupAdminLogicABI`](abi/rollupAdminLogicABI.md#rollupadminlogicabi)

#### Source

[src/rollupAdminLogicReadContract.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicReadContract.ts#L15)

***

### RollupAdminLogicFunctionName

> **RollupAdminLogicFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`RollupAdminLogicAbi`](rollupAdminLogicReadContract.md#rollupadminlogicabi)\>

#### Source

[src/rollupAdminLogicReadContract.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicReadContract.ts#L16)

***

### RollupAdminLogicReadContractParameters\<TFunctionName\>

> **RollupAdminLogicReadContractParameters**\<`TFunctionName`\>: `object` & `GetFunctionArgs` \<[`RollupAdminLogicAbi`](rollupAdminLogicReadContract.md#rollupadminlogicabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

The name of the function to call on the RollupAdminLogic contract

##### rollup

> **rollup**: `Address`

The address of the RollupAdminLogic contract

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

#### Source

[src/rollupAdminLogicReadContract.ts:18](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicReadContract.ts#L18)

***

### RollupAdminLogicReadContractReturnType\<TFunctionName\>

> **RollupAdminLogicReadContractReturnType**\<`TFunctionName`\>: `ReadContractReturnType` \<[`RollupAdminLogicAbi`](rollupAdminLogicReadContract.md#rollupadminlogicabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

#### Source

[src/rollupAdminLogicReadContract.ts:31](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicReadContract.ts#L31)

## Functions

### rollupAdminLogicReadContract()

> **rollupAdminLogicReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`RollupAdminLogicReadContractReturnType`](rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

Reads data from the RollupAdminLogic contract on the specified rollup chain
and returns the result.

#### Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the chain (or undefined)

• **TFunctionName** *extends* `"wasmModuleRoot"` \| `"chainId"` \| `"_stakerMap"` \| `"amountStaked"` \| `"latestStakedNode"` \| `"currentChallenge"` \| `"isStaked"` \| `"baseStake"` \| `"bridge"` \| `"challengeManager"` \| `"confirmPeriodBlocks"` \| `"createNitroMigrationGenesis"` \| `"extraChallengeTimeBlocks"` \| `"firstUnresolvedNode"` \| `"forceConfirmNode"` \| `"forceCreateNode"` \| `"forceRefundStaker"` \| `"forceResolveChallenge"` \| `"getNode"` \| `"stakerCount"` \| `"getNodeCreationBlockForLogLookup"` \| `"getStaker"` \| `"getStakerAddress"` \| `"inbox"` \| `"stakeToken"` \| `"loserStakeEscrow"` \| `"sequencerInbox"` \| `"outbox"` \| `"rollupEventInbox"` \| `"validatorUtils"` \| `"validatorWalletCreator"` \| `"initialize"` \| `"isStakedOnLatestConfirmed"` \| `"isValidator"` \| `"isZombie"` \| `"lastStakeBlock"` \| `"latestConfirmed"` \| `"latestNodeCreated"` \| `"minimumAssertionPeriod"` \| `"nodeHasStaker"` \| `"pause"` \| `"paused"` \| `"proxiableUUID"` \| `"removeOldOutbox"` \| `"resume"` \| `"rollupDeploymentBlock"` \| `"setBaseStake"` \| `"setConfirmPeriodBlocks"` \| `"setDelayedInbox"` \| `"setExtraChallengeTimeBlocks"` \| `"setInbox"` \| `"setLoserStakeEscrow"` \| `"setMinimumAssertionPeriod"` \| `"setOutbox"` \| `"setOwner"` \| `"setSequencerInbox"` \| `"setStakeToken"` \| `"setValidator"` \| `"setValidatorWhitelistDisabled"` \| `"setWasmModuleRoot"` \| `"totalWithdrawableFunds"` \| `"upgradeBeacon"` \| `"upgradeSecondaryTo"` \| `"upgradeSecondaryToAndCall"` \| `"upgradeTo"` \| `"upgradeToAndCall"` \| `"validatorWhitelistDisabled"` \| `"withdrawableFunds"` \| `"zombieAddress"` \| `"zombieCount"` \| `"zombieLatestStakedNode"`

The name of the function to call

#### Parameters

• **client**

The public client to use for the read operation

• **params**: [`RollupAdminLogicReadContractParameters`](rollupAdminLogicReadContract.md#rollupadminlogicreadcontractparameterstfunctionname)\<`TFunctionName`\>

The parameters for the read operation

#### Returns

`Promise` \<[`RollupAdminLogicReadContractReturnType`](rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

- The result of the read operation

#### Example

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

#### Source

[src/rollupAdminLogicReadContract.ts:60](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/rollupAdminLogicReadContract.ts#L60)
