[Documentation](../README.md) / decorators/arbAggregatorActions

## Functions

### arbAggregatorActions()

```ts
function arbAggregatorActions<TTransport, TChain>(client: object): ArbAggregatorActions<TChain>;
```

arbAggregatorActions returns an object with two functions:
arbAggregatorReadContract and arbAggregatorPrepareTransactionRequest. The
arbAggregatorReadContract function takes parameters for a specific function
name and returns a Promise of the corresponding contract return type. The
arbAggregatorPrepareTransactionRequest function takes parameters for a
specific transaction request function name and returns a Promise of the
prepare transaction request return type along with the chain ID.

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

`ArbAggregatorActions`\<`TChain`\>

#### Source

[src/decorators/arbAggregatorActions.ts:36](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/decorators/arbAggregatorActions.ts#L36)
