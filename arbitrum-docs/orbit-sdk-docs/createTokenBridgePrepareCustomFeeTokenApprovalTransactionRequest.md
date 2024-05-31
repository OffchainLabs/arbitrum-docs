[Documentation](README.md) / createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest

## Functions

### createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest()

```ts
function createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(__namedParameters: object): Promise<object | object | object>
```

Creates a custom fee token approval transaction request for the Token Bridge.
It approves the specified amount of tokens for the Token Bridge creator
address or an overridden address. Returns a Prettify object with the
approval transaction request details and the chain ID.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.amount`? | `bigint` | - |
| `__namedParameters.nativeToken` | \`0x$\{string\}\` | - |
| `__namedParameters.owner` | \`0x$\{string\}\` | - |
| `__namedParameters.publicClient` | `object` | - |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts:25](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts#L25)
