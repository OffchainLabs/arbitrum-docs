---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# upgradeExecutorFetchPrivilegedAccounts

## Type Aliases

### UpgradeExecutorFetchPrivilegedAccountsParams\<TChain\>

> **UpgradeExecutorFetchPrivilegedAccountsParams**\<`TChain`\>: `object`

This type is for the params of the [upgradeExecutorFetchPrivilegedAccounts](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccounts) function

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Type declaration

##### publicClient

> **publicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TChain`\>

##### upgradeExecutorAddress

> **upgradeExecutorAddress**: [`mainnet`](chains.md#mainnet)

#### Source

[upgradeExecutorFetchPrivilegedAccounts.ts:8](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorFetchPrivilegedAccounts.ts#L8)

***

### UpgradeExecutorPrivilegedAccounts

> **UpgradeExecutorPrivilegedAccounts**: `object`

This type is for the result of the [upgradeExecutorFetchPrivilegedAccounts](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccounts) function.

It is an object containing the addresses of the privileged accounts as keys,
and an array with a hash for each role they have.

#### Index signature

 \[`account`: \`0x$\{string\}\`\]: [`UpgradeExecutorRole`](upgradeExecutorEncodeFunctionData.md#upgradeexecutorrole)[]

#### Source

[upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)

## Functions

### upgradeExecutorFetchPrivilegedAccounts()

> **upgradeExecutorFetchPrivilegedAccounts**\<`TChain`\>(`upgradeExecutorFetchPrivilegedAccountsParams`): `Promise` \<[`UpgradeExecutorPrivilegedAccounts`](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorprivilegedaccounts)\>

Returns all accounts that have been granted a role in the UpgradeExecutor

Returns an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have.

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **upgradeExecutorFetchPrivilegedAccountsParams**: [`UpgradeExecutorFetchPrivilegedAccountsParams`](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccountsparamstchain)\<`TChain`\>

[UpgradeExecutorFetchPrivilegedAccountsParams](upgradeExecutorFetchPrivilegedAccounts.md#upgradeexecutorfetchprivilegedaccountsparamstchain)

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

[upgradeExecutorFetchPrivilegedAccounts.ts:92](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorFetchPrivilegedAccounts.ts#L92)
