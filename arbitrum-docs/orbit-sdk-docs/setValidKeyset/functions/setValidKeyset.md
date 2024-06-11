---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: setValidKeyset()

> **setValidKeyset**(`setValidKeysetParams`): `Promise`\<`any`\>

Sets the valid keyset for a contract on the parent chain.

## Parameters

• **setValidKeysetParams**: [`SetValidKeysetParams`](../type-aliases/SetValidKeysetParams.md)

The parameters for setting the valid keyset.

## Returns

`Promise`\<`any`\>

The transaction receipt after setting the valid keyset.

## Throws

Will throw an error if the account is undefined.

## Example

```ts
const txReceipt = await setValidKeyset({
  coreContracts: {
    upgradeExecutor: '0x123...456',
    sequencerInbox: '0x789...abc',
  },
  keyset: '0xdef...012',
  publicClient,
  walletClient,
});
console.log(txReceipt);
```

## Source

[src/setValidKeyset.ts:42](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/setValidKeyset.ts#L42)
