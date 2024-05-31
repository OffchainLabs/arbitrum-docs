[Documentation](../README.md) / types/ParentChain

## Functions

### validateParentChainPublicClient()

```ts
function validateParentChainPublicClient<TTransport, TChain>(
  publicClient: object,
): ParentChainPublicClient;
```

Validates and returns a ParentChainPublicClient based on the provided
PublicClient, ensuring that the parent chain is supported.

#### Type parameters

| Type parameter                            | Value                  |
| :---------------------------------------- | :--------------------- |
| `TTransport` _extends_ `Transport`        | `Transport`            |
| `TChain` _extends_ `undefined` \| `Chain` | `undefined` \| `Chain` |

#### Parameters

| Parameter      | Type     |
| :------------- | :------- |
| `publicClient` | `object` |

#### Returns

`ParentChainPublicClient`

#### Source

[src/types/ParentChain.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/types/ParentChain.ts#L41)
