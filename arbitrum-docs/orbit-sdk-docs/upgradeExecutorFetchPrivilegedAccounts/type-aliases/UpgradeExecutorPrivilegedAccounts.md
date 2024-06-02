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

[src/upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)
