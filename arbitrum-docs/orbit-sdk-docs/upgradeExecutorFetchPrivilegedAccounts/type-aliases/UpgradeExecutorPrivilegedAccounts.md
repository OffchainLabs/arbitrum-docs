```ts
type UpgradeExecutorPrivilegedAccounts: object;
```

This type is for the result of the [upgradeExecutorFetchPrivilegedAccounts](../functions/upgradeExecutorFetchPrivilegedAccounts.md) function.

It is an object containing the addresses of the privileged accounts as keys,
and an array with a hash for each role they have.

## Index signature

\[`account`: \`0x$\{string\}\`\]: `UpgradeExecutorRole`[]

## Source

[src/upgradeExecutorFetchPrivilegedAccounts.ts:19](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/efea61c53fc08d3a6a336315cc447bc7613aada5/src/upgradeExecutorFetchPrivilegedAccounts.ts#L19)
