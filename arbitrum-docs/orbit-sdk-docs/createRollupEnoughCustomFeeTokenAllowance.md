---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupEnoughCustomFeeTokenAllowance

## Type Aliases

### CreateRollupEnoughCustomFeeTokenAllowanceParams

> **CreateRollupEnoughCustomFeeTokenAllowanceParams**: [`Prettify`](types/utils.md#prettifyt) \<[`WithRollupCreatorAddressOverride`](types/createRollupTypes.md#withrollupcreatoraddressoverridet)\<`object`\>\>

#### Source

[src/createRollupEnoughCustomFeeTokenAllowance.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupEnoughCustomFeeTokenAllowance.ts#L10)

## Functions

### createRollupEnoughCustomFeeTokenAllowance()

> **createRollupEnoughCustomFeeTokenAllowance**(`params`): `Promise`\<`boolean`\>

Checks if the allowance for a specific native token is enough for creating a rollup with custom fees.

Fetches the allowance using the owner's account and the spender address, which is either provided or fetched
from the Rollup creator address. The function returns a boolean indicating whether the allowance is greater than
or equal to the default retryable fees required for creating the rollup.

#### Parameters

• **params**

The parameters for checking the allowance.

• **params.account**: \`0x$\{string\}\`

The address of the owner's account.

• **params.nativeToken**: \`0x$\{string\}\`

The address of the native token.

• **params.publicClient**

The public client used to interact with the blockchain.

• **params.rollupCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`boolean`\>

- A promise that resolves to a boolean indicating if the allowance is sufficient.

#### Example

```ts
const isAllowanceEnough = await createRollupEnoughCustomFeeTokenAllowance({
  nativeToken: '0xTokenAddress',
  account: '0xOwnerAddress',
  publicClient,
});
console.log(isAllowanceEnough); // true or false
```

#### Source

[src/createRollupEnoughCustomFeeTokenAllowance.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupEnoughCustomFeeTokenAllowance.ts#L41)
