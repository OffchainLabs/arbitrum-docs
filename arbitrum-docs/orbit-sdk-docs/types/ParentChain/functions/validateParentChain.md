[Documentation](../../../README.md) / [types/ParentChain](../README.md) / validateParentChain

```ts
function validateParentChain<TChain>(
  chainIdOrClient: number | Client<Transport, TChain>,
): ParentChainId;
```

## Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `undefined` \| `Chain` |

## Parameters

| Parameter         | Type                                          |
| :---------------- | :-------------------------------------------- |
| `chainIdOrClient` | `number` \| `Client`\<`Transport`, `TChain`\> |

## Returns

[`ParentChainId`](../type-aliases/ParentChainId.md)

## Source

[src/types/ParentChain.ts:22](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/types/ParentChain.ts#L22)
