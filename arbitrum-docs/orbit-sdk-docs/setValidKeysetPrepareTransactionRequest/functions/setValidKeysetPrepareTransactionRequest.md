---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: setValidKeysetPrepareTransactionRequest()

> **setValidKeysetPrepareTransactionRequest**(`setValidKeysetPrepareTransactionRequestParams`): `Promise`\<`any`\>

Sets up a transaction request to upgrade the executor with a valid keyset.
This function prepares the transaction request by encoding the necessary
function data and validating the parent chain. It returns the prepared
transaction request along with the chain ID.

## Parameters

• **setValidKeysetPrepareTransactionRequestParams**: [`SetValidKeysetPrepareTransactionRequestParams`](../type-aliases/SetValidKeysetPrepareTransactionRequestParams.md)

Parameters for preparing the transaction request

## Returns

`Promise`\<`any`\>

- The prepared transaction request along with the chain ID

## Example

```ts
const txRequest = await setValidKeysetPrepareTransactionRequest({
  coreContracts: {
    upgradeExecutor: '0x...',
    sequencerInbox: '0x...',
  },
  keyset: {
    keys: ['0x...'],
    threshold: 1,
  },
  account: '0x...',
  publicClient,
});
```

## Source

[src/setValidKeysetPrepareTransactionRequest.ts:43](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/setValidKeysetPrepareTransactionRequest.ts#L43)
