---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function rollupAdminLogicReadContract<TChain, TFunctionName>(client: object, params: RollupAdminLogicReadContractParameters<TFunctionName>): Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>
```

Reads data from the RollupAdminLogic contract on the specified rollup chain
and returns the result.

## Type parameters

| Type parameter |
| :------ |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |
| `TFunctionName` *extends* 
  \| `"wasmModuleRoot"`
  \| `"chainId"`
  \| `"_stakerMap"`
  \| `"amountStaked"`
  \| `"latestStakedNode"`
  \| `"currentChallenge"`
  \| `"isStaked"`
  \| `"baseStake"`
  \| `"bridge"`
  \| `"challengeManager"`
  \| `"confirmPeriodBlocks"`
  \| `"createNitroMigrationGenesis"`
  \| `"extraChallengeTimeBlocks"`
  \| `"firstUnresolvedNode"`
  \| `"forceConfirmNode"`
  \| `"forceCreateNode"`
  \| `"forceRefundStaker"`
  \| `"forceResolveChallenge"`
  \| `"getNode"`
  \| `"stakerCount"`
  \| `"getNodeCreationBlockForLogLookup"`
  \| `"getStaker"`
  \| `"getStakerAddress"`
  \| `"inbox"`
  \| `"stakeToken"`
  \| `"loserStakeEscrow"`
  \| `"sequencerInbox"`
  \| `"outbox"`
  \| `"rollupEventInbox"`
  \| `"validatorUtils"`
  \| `"validatorWalletCreator"`
  \| `"initialize"`
  \| `"isStakedOnLatestConfirmed"`
  \| `"isValidator"`
  \| `"isZombie"`
  \| `"lastStakeBlock"`
  \| `"latestConfirmed"`
  \| `"latestNodeCreated"`
  \| `"minimumAssertionPeriod"`
  \| `"nodeHasStaker"`
  \| `"pause"`
  \| `"paused"`
  \| `"proxiableUUID"`
  \| `"removeOldOutbox"`
  \| `"resume"`
  \| `"rollupDeploymentBlock"`
  \| `"setBaseStake"`
  \| `"setConfirmPeriodBlocks"`
  \| `"setDelayedInbox"`
  \| `"setExtraChallengeTimeBlocks"`
  \| `"setInbox"`
  \| `"setLoserStakeEscrow"`
  \| `"setMinimumAssertionPeriod"`
  \| `"setOutbox"`
  \| `"setOwner"`
  \| `"setSequencerInbox"`
  \| `"setStakeToken"`
  \| `"setValidator"`
  \| `"setValidatorWhitelistDisabled"`
  \| `"setWasmModuleRoot"`
  \| `"totalWithdrawableFunds"`
  \| `"upgradeBeacon"`
  \| `"upgradeSecondaryTo"`
  \| `"upgradeSecondaryToAndCall"`
  \| `"upgradeTo"`
  \| `"upgradeToAndCall"`
  \| `"validatorWhitelistDisabled"`
  \| `"withdrawableFunds"`
  \| `"zombieAddress"`
  \| `"zombieCount"`
  \| `"zombieLatestStakedNode"` |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | `RollupAdminLogicReadContractParameters`\<`TFunctionName`\> |

## Returns

`Promise`\<`RollupAdminLogicReadContractReturnType`\<`TFunctionName`\>\>

## Source

[src/rollupAdminLogicReadContract.ts:33](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/rollupAdminLogicReadContract.ts#L33)
