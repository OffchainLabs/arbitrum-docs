[Documentation](../../README.md) / [rollupAdminLogicPrepareTransactionRequest](../README.md) / rollupAdminLogicPrepareFunctionData

```ts
function rollupAdminLogicPrepareFunctionData<TFunctionName>(
  params: RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>,
): object;
```

## Type parameters

| Type parameter |
| :------------- |

| `TFunctionName` _extends_
\| `"outbox"`
\| `"rollupEventInbox"`
\| `"challengeManager"`
\| `"sequencerInbox"`
\| `"bridge"`
\| `"validatorUtils"`
\| `"validatorWalletCreator"`
\| `"confirmPeriodBlocks"`
\| `"extraChallengeTimeBlocks"`
\| `"stakeToken"`
\| `"baseStake"`
\| `"wasmModuleRoot"`
\| `"loserStakeEscrow"`
\| `"chainId"`
\| `"_stakerMap"`
\| `"amountStaked"`
\| `"latestStakedNode"`
\| `"currentChallenge"`
\| `"isStaked"`
\| `"createNitroMigrationGenesis"`
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

| Parameter | Type                                                               |
| :-------- | :----------------------------------------------------------------- |
| `params`  | `RollupAdminLogicPrepareFunctionDataParameters`\<`TFunctionName`\> |

## Returns

`object`

| Member  | Type              | Value         |
| :------ | :---------------- | :------------ |
| `data`  | \`0x$\{string\}\` | ...           |
| `to`    | \`0x$\{string\}\` | params.rollup |
| `value` | `bigint`          | ...           |

## Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/rollupAdminLogicPrepareTransactionRequest.ts#L41)
