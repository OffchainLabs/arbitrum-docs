---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# setValidKeyset

## Type Aliases

### SetValidKeysetParams\<TChain\>

> **SetValidKeysetParams**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Type declaration

##### coreContracts

> **coreContracts**: `Pick` \<[`CoreContracts`](types/CoreContracts.md#corecontracts), `"upgradeExecutor"` \| `"sequencerInbox"`\>

##### keyset

> **keyset**: \`0x$\{string\}\`

##### publicClient

> **publicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TChain`\>

##### walletClient

> **walletClient**: [`mainnet`](chains.md#mainnet)

#### Source

[setValidKeyset.ts:8](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/setValidKeyset.ts#L8)

## Functions

### setValidKeyset()

> **setValidKeyset**\<`TChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**: [`SetValidKeysetParams`](setValidKeyset.md#setvalidkeysetparamstchain)\<`TChain`\>

#### Returns

`Promise`\<`any`\>

#### Source

[setValidKeyset.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/setValidKeyset.ts#L15)
