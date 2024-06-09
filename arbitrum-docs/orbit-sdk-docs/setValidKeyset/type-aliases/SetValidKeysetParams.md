---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type SetValidKeysetParams: object;
```

## Type declaration

| Member          | Type                                                                                                                             |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `coreContracts` | `Pick` \<[`CoreContracts`](../../types/CoreContracts/type-aliases/CoreContracts.md), `"upgradeExecutor"` \| `"sequencerInbox"`\> |
| `keyset`        | \`0x$\{string\}\`                                                                                                                |
| `publicClient`  | `PublicClient`                                                                                                                   |
| `walletClient`  | `WalletClient`                                                                                                                   |

## Source

[src/setValidKeyset.ts:8](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/setValidKeyset.ts#L8)
