---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: upgradeExecutorFetchPrivilegedAccounts()

> **upgradeExecutorFetchPrivilegedAccounts**(`upgradeExecutorFetchPrivilegedAccountsParams`): `Promise` \<[`UpgradeExecutorPrivilegedAccounts`](../type-aliases/UpgradeExecutorPrivilegedAccounts.md)\>

Returns all accounts that have been granted a role in the UpgradeExecutor

Returns an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have.

## Parameters

• **upgradeExecutorFetchPrivilegedAccountsParams**: [`UpgradeExecutorFetchPrivilegedAccountsParams`](../type-aliases/UpgradeExecutorFetchPrivilegedAccountsParams.md)

[UpgradeExecutorFetchPrivilegedAccountsParams](../type-aliases/UpgradeExecutorFetchPrivilegedAccountsParams.md)

## Returns

`Promise` \<[`UpgradeExecutorPrivilegedAccounts`](../type-aliases/UpgradeExecutorPrivilegedAccounts.md)\>

Promise<[UpgradeExecutorPrivilegedAccounts](../type-aliases/UpgradeExecutorPrivilegedAccounts.md)> - an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have

## Example

```ts
const privilegedAccounts = await upgradeExecutorFetchPrivilegedAccounts({
  upgradeExecutorAddress,
  publicClient,
});
```

## Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:92](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/upgradeExecutorFetchPrivilegedAccounts.ts#L92)
