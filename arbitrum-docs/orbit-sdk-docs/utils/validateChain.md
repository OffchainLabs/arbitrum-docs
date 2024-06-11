---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/validateChain

## Functions

### validateChain()

> **validateChain**(`chainIdOrPublicClient`): `ChainId`

Validates the provided chain ID or PublicClient and ensures that it is a
supported chain within the system. Returns a ChainId.

#### Parameters

• **chainIdOrPublicClient**: `number` \| `object`

The chain ID or PublicClient to validate.

#### Returns

`ChainId`

The validated chain ID.

#### Throws

If the chain ID is not supported.

#### Source

[src/utils/validateChain.ts:25](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/validateChain.ts#L25)
