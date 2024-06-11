---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: validateChain()

> **validateChain**(`chainIdOrPublicClient`): `ChainId`

Validates the provided chain ID or PublicClient and ensures that it is a
supported chain within the system. Returns a ChainId.

## Parameters

• **chainIdOrPublicClient**: `number` \| `object`

The chain ID or PublicClient to validate.

## Returns

`ChainId`

The validated chain ID.

## Throws

If the chain ID is not supported.

## Source

[src/utils/validateChain.ts:25](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/validateChain.ts#L25)
