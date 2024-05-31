[Documentation](README.md) / createTokenBridgeFetchTokenBridgeContracts

## Functions

### createTokenBridgeFetchTokenBridgeContracts()

```ts
function createTokenBridgeFetchTokenBridgeContracts(
  __namedParameters: object,
): Promise<TokenBridgeContracts>;
```

Fetches the token bridge contracts addresses for both the parent chain and
the orbit chain based on the provided inbox address and parent chain public
client. Returns a TokenBridgeContracts object containing the
addresses of various contract types for both chains.

#### Parameters

| Parameter                                              | Type              | Description                                                                                                                                |
| :----------------------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters`                                    | `object`          | -                                                                                                                                          |
| `__namedParameters.inbox`                              | \`0x$\{string\}\` | -                                                                                                                                          |
| `__namedParameters.parentChainPublicClient`            | `object`          | -                                                                                                                                          |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

#### Returns

`Promise`\<`TokenBridgeContracts`\>

#### Source

[src/createTokenBridgeFetchTokenBridgeContracts.ts:23](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridgeFetchTokenBridgeContracts.ts#L23)
