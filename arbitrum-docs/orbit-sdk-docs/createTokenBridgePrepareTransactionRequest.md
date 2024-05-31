[Documentation](README.md) / createTokenBridgePrepareTransactionRequest

## Functions

### createTokenBridgePrepareTransactionRequest()

```ts
function createTokenBridgePrepareTransactionRequest(__namedParameters: object): Promise<object | object | object>
```

Creates a token bridge prepare transaction request for transferring tokens
between chains. It prepares the transaction request to create a token bridge
on the specified rollup chain, using the provided parameters and gas
overrides. Returns the prepared transaction request with the chain ID.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.account` | \`0x$\{string\}\` | - |
| `__namedParameters.gasOverrides`? | `TransactionRequestGasOverrides` | - |
| `__namedParameters.orbitChainPublicClient` | `object` | - |
| `__namedParameters.params` | `object` | - |
| `__namedParameters.params.rollup` | \`0x$\{string\}\` | - |
| `__namedParameters.params.rollupOwner` | \`0x$\{string\}\` | - |
| `__namedParameters.parentChainPublicClient` | `object` | - |
| `__namedParameters.retryableGasOverrides`? | `TransactionRequestRetryableGasOverrides` | - |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/createTokenBridgePrepareTransactionRequest.ts:42](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridgePrepareTransactionRequest.ts#L42)
