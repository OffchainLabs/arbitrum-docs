---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgeEnoughCustomFeeTokenAllowance(
  __namedParameters: object,
): Promise<boolean>;
```

Creates a token bridge with enough custom fee token allowance. This function
fetches the allowance for a native token owned by a specified address,
compares it to the default retryable fees for creating a token bridge, and
returns a boolean indicating if the allowance is sufficient.

## Parameters

| Parameter                                              | Type              | Description                                                                                                                                |
| :----------------------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters`                                    | `object`          | -                                                                                                                                          |
| `__namedParameters.nativeToken`                        | \`0x$\{string\}\` | -                                                                                                                                          |
| `__namedParameters.owner`                              | \`0x$\{string\}\` | -                                                                                                                                          |
| `__namedParameters.publicClient`                       | `object`          | -                                                                                                                                          |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`boolean`\>

## Source

[src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts:24](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts#L24)
