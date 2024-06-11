---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/getters

## Functions

### getBlockExplorerUrl()

> **getBlockExplorerUrl**(`chain`): `undefined` \| `string`

Returns the URL of the block explorer for a given Chain.

#### Parameters

• **chain**: `Chain`\<`undefined` \| `ChainFormatters`\>

The chain instance.

#### Returns

`undefined` \| `string`

- The URL of the block explorer or undefined if not available.

#### Source

[src/utils/getters.ts:46](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/getters.ts#L46)

***

### getRollupCreatorAddress()

> **getRollupCreatorAddress**(`client`): `any`

Returns the address of the rollup creator for a given public client.

#### Parameters

• **client**

The public client instance.

#### Returns

`any`

- The address of the rollup creator.

#### Throws

- If the parent chain is not supported.

#### Source

[src/utils/getters.ts:13](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/getters.ts#L13)

***

### getTokenBridgeCreatorAddress()

> **getTokenBridgeCreatorAddress**(`client`): `any`

Returns the address of the token bridge creator for a specific chain based on the provided PublicClient.

#### Parameters

• **client**

The public client instance.

#### Returns

`any`

- The address of the token bridge creator.

#### Throws

- If the parent chain is not supported.

#### Source

[src/utils/getters.ts:30](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/getters.ts#L30)
