[Documentation](../../../README.md) / [types/createTokenBridgeTypes](../README.md) / WithTokenBridgeCreatorAddressOverride

```ts
type WithTokenBridgeCreatorAddressOverride<T>: T & object;
```

## Type declaration

| Member                              | Type      | Description                                                                                                                                |
| :---------------------------------- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `tokenBridgeCreatorAddressOverride` | `Address` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Type parameters

| Type parameter |
| :------------- |
| `T`            |

## Source

[src/types/createTokenBridgeTypes.ts:3](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/types/createTokenBridgeTypes.ts#L3)
