[Documentation](../README.md) / decorators/rollupAdminLogicPublicActions

## Functions

### rollupAdminLogicPublicActions()

```ts
function rollupAdminLogicPublicActions<TParams, TTransport, TChain>(
  __namedParameters: TParams,
): (client: PublicClient<TTransport, TChain>) => RollupAdminLogicActions<TParams['rollup'], TChain>;
```

Returns a rollupAdminLogicActions function that provides methods to interact
with RollupAdminLogic contracts, such as reading contract data and preparing
transaction requests.

#### Type parameters

| Type parameter                            | Value       |
| :---------------------------------------- | :---------- |
| `TParams` _extends_ `object`              | -           |
| `TTransport` _extends_ `Transport`        | `Transport` |
| `TChain` _extends_ `undefined` \| `Chain` | `Chain`     |

#### Parameters

| Parameter           | Type      |
| :------------------ | :-------- |
| `__namedParameters` | `TParams` |

#### Returns

`Function`

##### Parameters

| Parameter | Type                                     |
| :-------- | :--------------------------------------- |
| `client`  | `PublicClient`\<`TTransport`, `TChain`\> |

##### Returns

`RollupAdminLogicActions`\<`TParams`\[`"rollup"`\], `TChain`\>

#### Source

[src/decorators/rollupAdminLogicPublicActions.ts:49](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/decorators/rollupAdminLogicPublicActions.ts#L49)
