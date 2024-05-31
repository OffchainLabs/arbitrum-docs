[Documentation](README.md) / createTokenBridgeEnoughCustomFeeTokenAllowance

## Functions

### createTokenBridgeEnoughCustomFeeTokenAllowance()

```ts
function createTokenBridgeEnoughCustomFeeTokenAllowance(
  __namedParameters: object,
): Promise<boolean>;
```

createTokenBridgeEnoughCustomFeeTokenAllowance checks if the token allowance
for a specific owner is enough to cover the default retryable fees set in the
Token Bridge. It returns a boolean value indicating whether the allowance is
sufficient or not.

#### Parameters

| Parameter                                              | Type              | Description                                                                                                                                |
| :----------------------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters`                                    | `object`          | -                                                                                                                                          |
| `__namedParameters.nativeToken`                        | \`0x$\{string\}\` | -                                                                                                                                          |
| `__namedParameters.owner`                              | \`0x$\{string\}\` | -                                                                                                                                          |
| `__namedParameters.publicClient`                       | `object`          | -                                                                                                                                          |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

#### Returns

`Promise`\<`boolean`\>

#### Source

[src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts:24](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridgeEnoughCustomFeeTokenAllowance.ts#L24)
