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

[src/upgradeExecutorEncodeFunctionData.ts:24](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorEncodeFunctionData.ts#L24)

***

### UpgradeExecutorEncodeFunctionDataParameters\<TFunctionName\>

> **UpgradeExecutorEncodeFunctionDataParameters**\<`TFunctionName`\>: [`Prettify`](types/utils.md#prettifyt)\<`Omit`\<`EncodeFunctionDataParameters` \<[`UpgradeExecutorAbi`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorabi), `TFunctionName`\>, `"abi"`\>\>

#### Type parameters

• **TFunctionName** *extends* [`UpgradeExecutorFunctionName`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorfunctionname)

#### Source

[src/upgradeExecutorEncodeFunctionData.ts:36](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorEncodeFunctionData.ts#L36)

***

### UpgradeExecutorFunctionName

> **UpgradeExecutorFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`UpgradeExecutorAbi`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorabi)\>

#### Source

[src/upgradeExecutorEncodeFunctionData.ts:29](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorEncodeFunctionData.ts#L29)

***

### UpgradeExecutorRole

> **UpgradeExecutorRole**: *typeof* [`UPGRADE_EXECUTOR_ROLE_ADMIN`](upgradeExecutorEncodeFunctionData.md#upgrade_executor_role_admin) \| *typeof* [`UPGRADE_EXECUTOR_ROLE_EXECUTOR`](upgradeExecutorEncodeFunctionData.md#upgrade_executor_role_executor)

#### Source

[src/upgradeExecutorEncodeFunctionData.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorEncodeFunctionData.ts#L17)

## Variables

### UPGRADE\_EXECUTOR\_ROLE\_ADMIN

> `const` **UPGRADE\_EXECUTOR\_ROLE\_ADMIN**: \`0x$\{string\}\`

Roles

#### Constant

UPGRADE_EXECUTOR_ROLE_ADMIN - Role hash for the admin role

#### Constant

UPGRADE_EXECUTOR_ROLE_EXECUTOR - Role hash for the executor role

#### Source

[src/upgradeExecutorEncodeFunctionData.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorEncodeFunctionData.ts#L10)

***

### UPGRADE\_EXECUTOR\_ROLE\_EXECUTOR

> `const` **UPGRADE\_EXECUTOR\_ROLE\_EXECUTOR**: \`0x$\{string\}\`

#### Source

[src/upgradeExecutorEncodeFunctionData.ts:11](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorEncodeFunctionData.ts#L11)

## Functions

### upgradeExecutorEncodeFunctionData()

> **upgradeExecutorEncodeFunctionData**\<`TFunctionName`\>(`params`): `string`

Encodes a function call to be sent through the UpgradeExecutor

#### Type parameters

• **TFunctionName** *extends* `unknown`

#### Parameters

• **params**: \{ \[K in string \| number \| symbol\]: Omit\<EncodeFunctionDataParameters\<any, TFunctionName, any\>, "abi"\>\[K\] \}

Parameters for encoding function data

#### Returns

`string`

Encoded function data

#### Source

[src/upgradeExecutorEncodeFunctionData.ts:49](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorEncodeFunctionData.ts#L49)
