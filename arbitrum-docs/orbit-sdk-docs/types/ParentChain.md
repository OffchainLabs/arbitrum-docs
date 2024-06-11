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

[src/types/ParentChain.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/ParentChain.ts#L7)

***

### ParentChainId

> **ParentChainId**: [`ParentChain`](ParentChain.md#parentchain)\[`"id"`\]

#### Source

[src/types/ParentChain.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/ParentChain.ts#L8)

***

### ParentChainPublicClient

> **ParentChainPublicClient**: [`Prettify`](utils.md#prettifyt)\<`Omit`\<`PublicClient`, `"chain"`\> & `object`\>

#### Source

[src/types/ParentChain.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/ParentChain.ts#L10)

## Functions

### validateParentChain()

> **validateParentChain**\<`TTransport`, `TChain`\>(`chainIdOrClient`): [`ParentChainId`](ParentChain.md#parentchainid)

Validates the provided parent chain ID to ensure it is supported by the
system. If the parent chain ID is not valid, an error is thrown with a
corresponding message. Returns the validated parent chain ID.

#### Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

#### Parameters

• **chainIdOrClient**: `number` \| `Client`\<`TTransport`, `TChain`, `undefined` \| `Account`\<\`0x$\{string\}\`\>, `undefined`, `undefined` \| `object`\>

#### Returns

[`ParentChainId`](ParentChain.md#parentchainid)

#### Source

[src/types/ParentChain.ts:29](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/ParentChain.ts#L29)

***

### validateParentChainPublicClient()

> **validateParentChainPublicClient**\<`TTransport`, `TChain`\>(`publicClient`): [`ParentChainPublicClient`](ParentChain.md#parentchainpublicclient)

Validates the parent chain of a PublicClient to ensure it is
supported. If the parent chain is not supported, an error is thrown. Returns
a [ParentChainPublicClient](ParentChain.md#parentchainpublicclient).

#### Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

#### Parameters

• **publicClient**

#### Returns

[`ParentChainPublicClient`](ParentChain.md#parentchainpublicclient)

#### Source

[src/types/ParentChain.ts:47](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/types/ParentChain.ts#L47)
