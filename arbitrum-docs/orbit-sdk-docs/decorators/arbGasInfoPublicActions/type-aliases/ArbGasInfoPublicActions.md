[Documentation](../../../README.md) / [decorators/arbGasInfoPublicActions](../README.md) / ArbGasInfoPublicActions

```ts
type ArbGasInfoPublicActions<TChain>: object;
```

## Type parameters

| Type parameter                            | Value                  |
| :---------------------------------------- | :--------------------- |
| `TChain` _extends_ `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member                   | Type                                                                                                                                                                                                                                                                                                                             |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arbGasInfoReadContract` | \<`TFunctionName`\>(`args`: [`ArbGasInfoReadContractParameters`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractParameters.md)\<`TFunctionName`\>) => `Promise`\<[`ArbGasInfoReadContractReturnType`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbGasInfoPublicActions.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/decorators/arbGasInfoPublicActions.ts#L10)
