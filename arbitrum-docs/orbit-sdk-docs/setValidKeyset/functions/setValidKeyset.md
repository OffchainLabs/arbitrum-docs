---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function setValidKeyset(__namedParameters: SetValidKeysetParams): Promise<any>;
```

Sets the valid keyset for a contract on the parent chain. It takes in the
core contracts, keyset, public client, and wallet client as parameters and
returns a transaction receipt TransactionReceipt.

## Parameters

| Parameter           | Type                                                              |
| :------------------ | :---------------------------------------------------------------- |
| `__namedParameters` | [`SetValidKeysetParams`](../type-aliases/SetValidKeysetParams.md) |

## Returns

`Promise`\<`any`\>

## Source

[src/setValidKeyset.ts:20](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/setValidKeyset.ts#L20)
