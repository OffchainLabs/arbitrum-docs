---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# upgradeExecutorFetchPrivilegedAccounts

## Type Aliases

### UpgradeExecutorFetchPrivilegedAccountsParams

> **UpgradeExecutorFetchPrivilegedAccountsParams**: `object`

This type is for the params of the [upgradeExecutorFetchPrivilegedAccounts](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccounts) function

#### Type declaration

##### publicClient

> **publicClient**: `PublicClient`

##### upgradeExecutorAddress

> **upgradeExecutorAddress**: `Address`

#### Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorFetchPrivilegedAccounts.ts#L8)

***

### UpgradeExecutorPrivilegedAccounts

> **UpgradeExecutorPrivilegedAccounts**: `object`

This type is for the result of the [upgradeExecutorFetchPrivilegedAccounts](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccounts) function.

It is an object containing the addresses of the privileged accounts as keys,
and an array with a hash for each role they have.

#### Index signature

 \[`account`: \`0x$\{string\}\`\]: [`UpgradeExecutorRole`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorrole)[]

#### Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)

## Functions

### upgradeExecutorFetchPrivilegedAccounts()

> **upgradeExecutorFetchPrivilegedAccounts**(`upgradeExecutorFetchPrivilegedAccountsParams`): `Promise` \<[`UpgradeExecutorPrivilegedAccounts`](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorprivilegedaccounts)\>

Returns all accounts that have been granted a role in the UpgradeExecutor

Returns an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have.

#### Parameters

• **upgradeExecutorFetchPrivilegedAccountsParams**: [`UpgradeExecutorFetchPrivilegedAccountsParams`](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccountsparams)

[UpgradeExecutorFetchPrivilegedAccountsParams](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccountsparams)

#### Returns

`Promise` \<[`UpgradeExecutorPrivilegedAccounts`](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorprivilegedaccounts)\>

Promise<[UpgradeExecutorPrivilegedAccounts](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorprivilegedaccounts)> - an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have

#### Example

```ts
const privilegedAccounts = await upgradeExecutorFetchPrivilegedAccounts({
  upgradeExecutorAddress,
  publicClient,
});
```

#### Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:92](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorFetchPrivilegedAccounts.ts#L92)
