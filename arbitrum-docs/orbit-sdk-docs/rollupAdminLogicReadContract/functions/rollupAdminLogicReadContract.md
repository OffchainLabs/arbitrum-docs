---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function rollupAdminLogicReadContract<TChain, TFunctionName>(client: object, params: RollupAdminLogicReadContractParameters<TFunctionName>): Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>
```

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
| `params` | [`RollupAdminLogicReadContractParameters`](../type-aliases/RollupAdminLogicReadContractParameters.md)\<`TFunctionName`\> |

## Returns

`Promise` \<[`RollupAdminLogicReadContractReturnType`](../type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/rollupAdminLogicReadContract.ts:29](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/rollupAdminLogicReadContract.ts#L29)
