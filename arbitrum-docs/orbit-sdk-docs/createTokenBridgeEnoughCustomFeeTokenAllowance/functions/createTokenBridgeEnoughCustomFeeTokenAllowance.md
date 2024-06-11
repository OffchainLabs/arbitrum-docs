---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridgeEnoughCustomFeeTokenAllowance()

> **createTokenBridgeEnoughCustomFeeTokenAllowance**(`params`): `Promise`\<`boolean`\>

Creates a token bridge with enough custom fee token allowance.

This function fetches the allowance for a native token owned by a specified address,
compares it to the default retryable fees for creating a token bridge, and
returns a boolean indicating if the allowance is sufficient.

## Parameters

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

## Returns

`Promise`\<`boolean`\>

- Returns true if the allowance is sufficient, otherwise false

## Example

```ts
const isAllowanceSufficient = await createTokenBridgeEnoughCustomFeeTokenAllowance({
  nativeToken: '0xTokenAddress',
  owner: '0xOwnerAddress',
  publicClient,
});
console.log(isAllowanceSufficient);
```

## Source

[src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts#L41)
