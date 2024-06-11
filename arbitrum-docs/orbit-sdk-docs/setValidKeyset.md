---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# setValidKeyset

## Type Aliases

### SetValidKeysetParams

> **SetValidKeysetParams**: `object`

#### Type declaration

##### coreContracts

> **coreContracts**: `Pick` \<[`CoreContracts`](types/CoreContracts.md#corecontracts), `"upgradeExecutor"` \| `"sequencerInbox"`\>

##### keyset

> **keyset**: \`0x$\{string\}\`

##### publicClient

> **publicClient**: `PublicClient`

##### walletClient

> **walletClient**: `WalletClient`

#### Source

[src/setValidKeyset.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/setValidKeyset.ts#L8)

## Functions

### setValidKeyset()

> **setValidKeyset**(`setValidKeysetParams`): `Promise`\<`any`\>

Sets the valid keyset for a contract on the parent chain.

#### Parameters

• **setValidKeysetParams**: [`SetValidKeysetParams`](setValidKeyset.md#setvalidkeysetparams)

The parameters for setting the valid keyset.

#### Returns

`Promise`\<`any`\>

The transaction receipt after setting the valid keyset.

#### Throws

Will throw an error if the account is undefined.

#### Example

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

#### Source

[src/setValidKeyset.ts:42](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/setValidKeyset.ts#L42)
