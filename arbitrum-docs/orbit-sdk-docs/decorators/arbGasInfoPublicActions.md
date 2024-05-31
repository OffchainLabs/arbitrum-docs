[Documentation](../README.md) / decorators/arbGasInfoPublicActions

## Functions

### arbGasInfoPublicActions()

```ts
function arbGasInfoPublicActions<TTransport, TChain>(
  client: object,
): ArbGasInfoPublicActions<TChain>;
```

Returns an object with a method `arbGasInfoReadContract` that takes
parameters and returns a Promise of the corresponding contract data.

#### Type parameters

| Type parameter                            | Value                  |
| :---------------------------------------- | :--------------------- |
| `TTransport` _extends_ `Transport`        | `Transport`            |
| `TChain` _extends_ `undefined` \| `Chain` | `undefined` \| `Chain` |

#### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `client`  | `object` |

#### Returns

`ArbGasInfoPublicActions`\<`TChain`\>

#### Source

[src/decorators/arbGasInfoPublicActions.ts:20](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/decorators/arbGasInfoPublicActions.ts#L20)
