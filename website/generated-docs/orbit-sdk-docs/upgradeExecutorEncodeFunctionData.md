---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# upgradeExecutorEncodeFunctionData

## Type Aliases

### UpgradeExecutorAbi

> **UpgradeExecutorAbi**: *typeof* [`abi`](contracts.md#abi-9)

#### Source

[upgradeExecutorEncodeFunctionData.ts:20](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorEncodeFunctionData.ts#L20)

***

### UpgradeExecutorEncodeFunctionDataParameters\<TFunctionName\>

> **UpgradeExecutorEncodeFunctionDataParameters**\<`TFunctionName`\>: [`Prettify`](types/utils.md#prettifyt)\<`Omit` \<[`mainnet`](chains.md#mainnet) \<[`UpgradeExecutorAbi`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorabi), `TFunctionName`\>, `"abi"`\>\>

#### Type parameters

• **TFunctionName** *extends* [`UpgradeExecutorFunctionName`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorfunctionname)

#### Source

[upgradeExecutorEncodeFunctionData.ts:22](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorEncodeFunctionData.ts#L22)

***

### UpgradeExecutorFunctionName

> **UpgradeExecutorFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`UpgradeExecutorAbi`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorabi)\>

#### Source

[upgradeExecutorEncodeFunctionData.ts:21](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorEncodeFunctionData.ts#L21)

***

### UpgradeExecutorRole

> **UpgradeExecutorRole**: *typeof* [`UPGRADE_EXECUTOR_ROLE_ADMIN`](upgradeExecutorEncodeFunctionData.md#upgrade_executor_role_admin) \| *typeof* [`UPGRADE_EXECUTOR_ROLE_EXECUTOR`](upgradeExecutorEncodeFunctionData.md#upgrade_executor_role_executor)

#### Source

[upgradeExecutorEncodeFunctionData.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorEncodeFunctionData.ts#L15)

## Variables

### UPGRADE\_EXECUTOR\_ROLE\_ADMIN

> `const` **UPGRADE\_EXECUTOR\_ROLE\_ADMIN**: `any`

0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775

#### Source

[upgradeExecutorEncodeFunctionData.ts:9](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorEncodeFunctionData.ts#L9)

***

### UPGRADE\_EXECUTOR\_ROLE\_EXECUTOR

> `const` **UPGRADE\_EXECUTOR\_ROLE\_EXECUTOR**: `any`

0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63

#### Source

[upgradeExecutorEncodeFunctionData.ts:14](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorEncodeFunctionData.ts#L14)

## Functions

### upgradeExecutorEncodeFunctionData()

> **upgradeExecutorEncodeFunctionData**\<`TFunctionName`\>(`__namedParameters`): `any`

#### Type parameters

• **TFunctionName** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

#### Returns

`any`

#### Source

[upgradeExecutorEncodeFunctionData.ts:27](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorEncodeFunctionData.ts#L27)
