[Documentation](../../../README.md) / [types/utils](../README.md) / GetFunctionName

```ts
type GetFunctionName<TAbi>: Extract<TAbi[number], object>["name"];
```

## Type parameters

| Type parameter         |
| :--------------------- |
| `TAbi` _extends_ `Abi` |

## Source

[src/types/utils.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/types/utils.ts#L8)
