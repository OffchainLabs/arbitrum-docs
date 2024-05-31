[Documentation](README.md) / rollupAdminLogicPrepareTransactionRequest

## Functions

### rollupAdminLogicPrepareTransactionRequest()

```ts
function rollupAdminLogicPrepareTransactionRequest<TFunctionName, TTransport, TChain>(
  client: object,
  params: RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>,
): Promise<object | object | object>;
```

Prepares a transaction request for executing a function on the Rollup Admin
Logic contract.

#### Type parameters

| Type parameter | Value |
| :------------- | :---- |

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
\| `"zombieLatestStakedNode"` | - |
| `TTransport` _extends_ `Transport` | `Transport` |
| `TChain` _extends_ `undefined` \| `Chain` | `undefined` \| `Chain` |

#### Parameters

| Parameter | Type                                                                     |
| :-------- | :----------------------------------------------------------------------- |
| `client`  | `object`                                                                 |
| `params`  | `RollupAdminLogicPrepareTransactionRequestParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:81](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/rollupAdminLogicPrepareTransactionRequest.ts#L81)
