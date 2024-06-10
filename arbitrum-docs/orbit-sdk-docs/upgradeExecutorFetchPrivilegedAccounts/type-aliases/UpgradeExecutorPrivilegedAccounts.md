---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type UpgradeExecutorPrivilegedAccounts: object;
```

This type is for the result of the [upgradeExecutorFetchPrivilegedAccounts](../functions/upgradeExecutorFetchPrivilegedAccounts.md) function.

It is an object containing the addresses of the privileged accounts as keys,
and an array with a hash for each role they have.

## Index signature

 \[`account`: \`0x$\{string\}\`\]: [`UpgradeExecutorRole`](../../upgradeExecutorEncodeFunctionData/type-aliases/UpgradeExecutorRole.md)[]

## Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)
