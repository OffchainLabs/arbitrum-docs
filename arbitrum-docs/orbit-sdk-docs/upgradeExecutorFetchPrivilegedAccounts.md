---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Type Aliases

### UpgradeExecutorFetchPrivilegedAccountsParams

```ts
type UpgradeExecutorFetchPrivilegedAccountsParams: object;
```

This type is for the params of the [upgradeExecutorFetchPrivilegedAccounts](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccounts) function

#### Type declaration

| Member | Type |
| :------ | :------ |
| `publicClient` | `PublicClient` |
| `upgradeExecutorAddress` | `Address` |

#### Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:8](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/upgradeExecutorFetchPrivilegedAccounts.ts#L8)

***

### UpgradeExecutorPrivilegedAccounts

```ts
type UpgradeExecutorPrivilegedAccounts: object;
```

This type is for the result of the [upgradeExecutorFetchPrivilegedAccounts](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccounts) function.

It is an object containing the addresses of the privileged accounts as keys,
and an array with a hash for each role they have.

#### Index signature

 \[`account`: \`0x$\{string\}\`\]: `UpgradeExecutorRole`[]

#### Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)

## Functions

### upgradeExecutorFetchPrivilegedAccounts()

```ts
function upgradeExecutorFetchPrivilegedAccounts(upgradeExecutorFetchPrivilegedAccountsParams: UpgradeExecutorFetchPrivilegedAccountsParams): Promise<UpgradeExecutorPrivilegedAccounts>
```

Returns all accounts that have been granted a role in the UpgradeExecutor

Returns an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `upgradeExecutorFetchPrivilegedAccountsParams` | [`UpgradeExecutorFetchPrivilegedAccountsParams`](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccountsparams) | [UpgradeExecutorFetchPrivilegedAccountsParams](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccountsparams) |

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

[src/upgradeExecutorFetchPrivilegedAccounts.ts:92](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/upgradeExecutorFetchPrivilegedAccounts.ts#L92)
