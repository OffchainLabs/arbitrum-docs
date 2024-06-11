---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgeEnoughCustomFeeTokenAllowance

## Type Aliases

### CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams

> **CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams**: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Source

[src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts#L10)

## Functions

### createTokenBridgeEnoughCustomFeeTokenAllowance()

> **createTokenBridgeEnoughCustomFeeTokenAllowance**(`params`): `Promise`\<`boolean`\>

Creates a token bridge with enough custom fee token allowance.

This function fetches the allowance for a native token owned by a specified address,
compares it to the default retryable fees for creating a token bridge, and
returns a boolean indicating if the allowance is sufficient.

#### Parameters

• **params**

The parameters for checking token allowance

• **params.nativeToken**: \`0x$\{string\}\`

The native token address

• **params.owner**: \`0x$\{string\}\`

The owner address

• **params.publicClient**

The public client

• **params.tokenBridgeCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`boolean`\>

- Returns true if the allowance is sufficient, otherwise false

#### Example

```ts
const isAllowanceSufficient = await createTokenBridgeEnoughCustomFeeTokenAllowance({
  nativeToken: '0xTokenAddress',
  owner: '0xOwnerAddress',
  publicClient,
});
console.log(isAllowanceSufficient);
```

#### Source

[src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts#L41)
