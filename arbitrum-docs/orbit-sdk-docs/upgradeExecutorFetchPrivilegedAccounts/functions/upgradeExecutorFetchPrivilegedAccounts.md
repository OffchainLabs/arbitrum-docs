---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function upgradeExecutorFetchPrivilegedAccounts(
  upgradeExecutorFetchPrivilegedAccountsParams: UpgradeExecutorFetchPrivilegedAccountsParams,
): Promise<UpgradeExecutorPrivilegedAccounts>;
```

Returns all accounts that have been granted a role in the UpgradeExecutor

Returns an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have.

## Parameters

| Parameter                                      | Type                                                                                                              | Description                                                                                                     |
| :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `upgradeExecutorFetchPrivilegedAccountsParams` | [`UpgradeExecutorFetchPrivilegedAccountsParams`](../type-aliases/UpgradeExecutorFetchPrivilegedAccountsParams.md) | [UpgradeExecutorFetchPrivilegedAccountsParams](../type-aliases/UpgradeExecutorFetchPrivilegedAccountsParams.md) |

## Returns

`Promise` \<[`UpgradeExecutorPrivilegedAccounts`](../type-aliases/UpgradeExecutorPrivilegedAccounts.md)\>

## Example

```ts
const privilegedAccounts = await upgradeExecutorFetchPrivilegedAccounts({
  upgradeExecutorAddress,
  publicClient,
});
```

## Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:92](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/upgradeExecutorFetchPrivilegedAccounts.ts#L92)
