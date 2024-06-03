---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupHelper(__namedParameters: object): Promise<object>
```

Creates a rollup chain with specified deployment parameters and validators.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.batchPoster` | \`0x$\{string\}\` |
| `__namedParameters.client` | `object` |
| `__namedParameters.deployer` | `PrivateKeyAccountWithPrivateKey` |
| `__namedParameters.nativeToken` | \`0x$\{string\}\` |
| `__namedParameters.validators` | [\`0x$\{string\}\`] |

## Returns

`Promise`\<`object`\>

| Member | Type |
| :------ | :------ |
| `createRollupConfig` | `object` |
| `createRollupConfig.baseStake` | `bigint` |
| `createRollupConfig.chainConfig` | `string` |
| `createRollupConfig.chainId` | `bigint` |
| `createRollupConfig.confirmPeriodBlocks` | `bigint` |
| `createRollupConfig.extraChallengeTimeBlocks` | `bigint` |
| `createRollupConfig.genesisBlockNum` | `bigint` |
| `createRollupConfig.loserStakeEscrow` | \`0x$\{string\}\` |
| `createRollupConfig.owner` | \`0x$\{string\}\` |
| `createRollupConfig.sequencerInboxMaxTimeVariation` | `object` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.delayBlocks` | `bigint` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.delaySeconds` | `bigint` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.futureBlocks` | `bigint` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.futureSeconds` | `bigint` |
| `createRollupConfig.stakeToken` | \`0x$\{string\}\` |
| `createRollupConfig.wasmModuleRoot` | \`0x$\{string\}\` |
| `createRollupInformation` | [`CreateRollupResults`](../../createRollup/type-aliases/CreateRollupResults.md) |

## Source

[src/testHelpers.ts:148](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/testHelpers.ts#L148)
