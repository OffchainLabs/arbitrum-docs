---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: UpgradeExecutorPrivilegedAccounts

> **UpgradeExecutorPrivilegedAccounts**: `object`

This type is for the result of the [upgradeExecutorFetchPrivilegedAccounts](../functions/upgradeExecutorFetchPrivilegedAccounts.md) function.

It is an object containing the addresses of the privileged accounts as keys,
and an array with a hash for each role they have.

## Index signature

 \[`account`: \`0x$\{string\}\`\]: [`UpgradeExecutorRole`](../../upgradeExecutorEncodeFunctionData/type-aliases/UpgradeExecutorRole.md)[]

## Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)
