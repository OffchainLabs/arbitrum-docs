[Documentation](../README.md) / utils/isCustomFeeTokenAddress

## Functions

### isCustomFeeTokenAddress()

```ts
function isCustomFeeTokenAddress(nativeToken: undefined | `0x${string}`): nativeToken is `0x${string}`
```

Checks if the provided token address is a custom fee token address. It
returns a Address if the token address is not undefined and not equal
to zeroAddress.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `nativeToken` | `undefined` \| \`0x$\{string\}\` |

#### Returns

nativeToken is \`0x$\{string\}\`

#### Source

[src/utils/isCustomFeeTokenAddress.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/isCustomFeeTokenAddress.ts#L8)
