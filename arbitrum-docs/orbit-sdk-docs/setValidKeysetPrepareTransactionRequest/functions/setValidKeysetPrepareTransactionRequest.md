---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function setValidKeysetPrepareTransactionRequest(
  __namedParameters: SetValidKeysetPrepareTransactionRequestParams,
): Promise<any>;
```

Sets up a transaction request to upgrade the executor with a valid keyset.
This function prepares the transaction request by encoding the necessary
function data and validating the parent chain. It returns the prepared
transaction request along with the chain ID.

## Parameters

| Parameter           | Type                                                                                                                |
| :------------------ | :------------------------------------------------------------------------------------------------------------------ |
| `__namedParameters` | [`SetValidKeysetPrepareTransactionRequestParams`](../type-aliases/SetValidKeysetPrepareTransactionRequestParams.md) |

## Returns

`Promise`\<`any`\>

## Source

[src/setValidKeysetPrepareTransactionRequest.ts:21](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/setValidKeysetPrepareTransactionRequest.ts#L21)
