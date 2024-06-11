---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# setValidKeysetPrepareTransactionRequest

## Type Aliases

### SetValidKeysetPrepareTransactionRequestParams

> **SetValidKeysetPrepareTransactionRequestParams**: `Omit` \<[`SetValidKeysetParams`](setValidKeyset.md#setvalidkeysetparams), `"walletClient"`\> & `object`

#### Type declaration

##### account

> **account**: `Address`

#### Source

[src/setValidKeysetPrepareTransactionRequest.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/setValidKeysetPrepareTransactionRequest.ts#L8)

## Functions

### setValidKeysetPrepareTransactionRequest()

> **setValidKeysetPrepareTransactionRequest**(`setValidKeysetPrepareTransactionRequestParams`): `Promise`\<`any`\>

Sets up a transaction request to upgrade the executor with a valid keyset.
This function prepares the transaction request by encoding the necessary
function data and validating the parent chain. It returns the prepared
transaction request along with the chain ID.

#### Parameters

• **setValidKeysetPrepareTransactionRequestParams**: [`SetValidKeysetPrepareTransactionRequestParams`](setValidKeysetPrepareTransactionRequest.md#setvalidkeysetpreparetransactionrequestparams)

Parameters for preparing the transaction request

#### Returns

`Promise`\<`any`\>

- The prepared transaction request along with the chain ID

#### Example

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

#### Source

[src/setValidKeysetPrepareTransactionRequest.ts:43](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/setValidKeysetPrepareTransactionRequest.ts#L43)
