[Documentation](README.md) / createRollupPrepareTransaction

## Functions

### createRollupPrepareTransaction()

```ts
function createRollupPrepareTransaction(tx: Transaction): CreateRollupTransaction
```

Creates a CreateRollupTransaction from the provided transaction by
decoding the function data and extracting the inputs for the "createRollup"
function.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `tx` | `Transaction` |

#### Returns

`CreateRollupTransaction`

#### Source

[src/createRollupPrepareTransaction.ts:22](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupPrepareTransaction.ts#L22)
