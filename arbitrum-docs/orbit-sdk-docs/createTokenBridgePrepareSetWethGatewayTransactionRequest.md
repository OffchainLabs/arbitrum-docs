[Documentation](README.md) / createTokenBridgePrepareSetWethGatewayTransactionRequest

## Functions

### createTokenBridgePrepareSetWethGatewayTransactionRequest()

```ts
function createTokenBridgePrepareSetWethGatewayTransactionRequest(
  __namedParameters: object,
): Promise<object | object | object>;
```

Creates a transaction request to set the WETH gateway on the parent chain
router, with gas overrides for retryable transactions. Returns the prepared
transaction request object.

#### Parameters

| Parameter                                              | Type                                      | Description                                                                                                                                |
| :----------------------------------------------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters`                                    | `object`                                  | -                                                                                                                                          |
| `__namedParameters.account`                            | \`0x$\{string\}\`                         | -                                                                                                                                          |
| `__namedParameters.orbitChainPublicClient`             | `object`                                  | -                                                                                                                                          |
| `__namedParameters.parentChainPublicClient`            | `object`                                  | -                                                                                                                                          |
| `__namedParameters.retryableGasOverrides`?             | `TransactionRequestRetryableGasOverrides` | -                                                                                                                                          |
| `__namedParameters.rollup`                             | \`0x$\{string\}\`                         | -                                                                                                                                          |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\`                         | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:97](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L97)
