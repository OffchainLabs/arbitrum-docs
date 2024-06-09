---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function rollupAdminLogicPrepareTransactionRequest<TFunctionName, TTransport, TChain>(
  client: object,
  params: RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>,
): Promise<any>;
```

Prepares a transaction request for a Rollup Admin Logic function to be
executed on a public client.

## Type parameters

| Type parameter | Value |
| :------------- | :---- |

| `TFunctionName` _extends_
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
\| `"zombieLatestStakedNode"` | - |
| `TTransport` _extends_ `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` _extends_ `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type                                                                                                                                               |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | `object`                                                                                                                                           |
| `params`  | [`RollupAdminLogicPrepareTransactionRequestParameters`](../type-aliases/RollupAdminLogicPrepareTransactionRequestParameters.md)\<`TFunctionName`\> |

## Returns

`Promise`\<`any`\>

## Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:81](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/rollupAdminLogicPrepareTransactionRequest.ts#L81)
