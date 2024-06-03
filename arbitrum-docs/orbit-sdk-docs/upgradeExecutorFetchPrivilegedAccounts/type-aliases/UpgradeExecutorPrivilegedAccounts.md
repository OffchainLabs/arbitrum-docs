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

 \[`account`: \`0x$\{string\}\`\]: `UpgradeExecutorRole`[]

## Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)
