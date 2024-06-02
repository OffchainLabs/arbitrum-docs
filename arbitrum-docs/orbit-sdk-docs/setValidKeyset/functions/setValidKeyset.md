---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function setValidKeyset(__namedParameters: SetValidKeysetParams): Promise<any>
```

Sets the valid keyset for a contract on the parent chain. It takes in the
core contracts, keyset, public client, and wallet client as parameters and
returns a transaction receipt TransactionReceipt.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `SetValidKeysetParams` |

## Returns

`Promise`\<`any`\>

## Source

[src/setValidKeyset.ts:20](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/setValidKeyset.ts#L20)
