---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# types/ParentChain

## Type Aliases

### ParentChain

> **ParentChain**: `Exclude`\<*typeof* [`chains`](../chains.md#chains)\[`number`\], `object`\>

#### Source

[types/ParentChain.ts:7](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/ParentChain.ts#L7)

***

### ParentChainId

> **ParentChainId**: [`ParentChain`](ParentChain.md#parentchain)\[`"id"`\]

#### Source

[types/ParentChain.ts:8](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/ParentChain.ts#L8)

***

### ParentChainPublicClient\<TChain\>

> **ParentChainPublicClient**\<`TChain`\>: [`Prettify`](utils.md#prettifyt) \<[`mainnet`](../chains.md#mainnet) \<[`mainnet`](../chains.md#mainnet), `TChain`\> & `object`\>

#### Type parameters

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Source

[types/ParentChain.ts:10](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/ParentChain.ts#L10)

## Functions

### validateParentChain()

> **validateParentChain**\<`TChain`\>(`chainIdOrClient`): [`ParentChainId`](ParentChain.md#parentchainid)

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **chainIdOrClient**: `any`

#### Returns

[`ParentChainId`](ParentChain.md#parentchainid)

#### Source

[types/ParentChain.ts:22](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/ParentChain.ts#L22)

***

### validateParentChainPublicClient()

> **validateParentChainPublicClient**\<`TChain`\>(`publicClient`): [`ParentChainPublicClient`](ParentChain.md#parentchainpublicclienttchain)\<`TChain`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **publicClient**: `PublicClient`\<`Transport`, `TChain`\>

#### Returns

[`ParentChainPublicClient`](ParentChain.md#parentchainpublicclienttchain)\<`TChain`\>

#### Source

[types/ParentChain.ts:34](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/ParentChain.ts#L34)
