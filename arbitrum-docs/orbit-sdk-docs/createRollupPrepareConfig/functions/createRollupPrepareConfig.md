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

[src/createRollupPrepareConfig.ts:37](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupPrepareConfig.ts#L37)
