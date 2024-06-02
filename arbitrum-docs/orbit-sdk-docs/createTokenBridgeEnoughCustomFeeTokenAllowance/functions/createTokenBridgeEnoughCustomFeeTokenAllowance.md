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

[src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts:24](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts#L24)
