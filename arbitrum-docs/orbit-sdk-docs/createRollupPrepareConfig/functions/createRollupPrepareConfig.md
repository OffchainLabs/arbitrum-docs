---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupPrepareConfig(__namedParameters: object): CreateRollupPrepareConfigResult
```

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.baseStake` | `undefined` \| `bigint` |
| `__namedParameters.chainConfig`? | [`ChainConfig`](../../types/ChainConfig/type-aliases/ChainConfig.md) |
| `__namedParameters.chainId` | `bigint` |
| `__namedParameters.confirmPeriodBlocks` | `undefined` \| `bigint` |
| `__namedParameters.extraChallengeTimeBlocks` | `undefined` \| `bigint` |
| `__namedParameters.genesisBlockNum` | `undefined` \| `bigint` |
| `__namedParameters.loserStakeEscrow` | `undefined` \| \`0x$\{string\}\` |
| `__namedParameters.owner` | \`0x$\{string\}\` |
| `__namedParameters.sequencerInboxMaxTimeVariation` | `undefined` \| `object` |
| `__namedParameters.stakeToken` | `undefined` \| \`0x$\{string\}\` |
| `__namedParameters.wasmModuleRoot` | `undefined` \| \`0x$\{string\}\` |

## Returns

[`CreateRollupPrepareConfigResult`](../type-aliases/CreateRollupPrepareConfigResult.md)

## Deprecated

Will be removed in a future release. Please use [createRollupPrepareDeploymentParamsConfig](../../createRollupPrepareDeploymentParamsConfig/functions/createRollupPrepareDeploymentParamsConfig.md) instead.

## Source

[src/createRollupPrepareConfig.ts:33](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createRollupPrepareConfig.ts#L33)
