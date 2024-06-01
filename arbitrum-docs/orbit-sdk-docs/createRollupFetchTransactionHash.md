[Documentation](README.md) / createRollupFetchTransactionHash

## Functions

### createRollupFetchTransactionHash()

```ts
function createRollupFetchTransactionHash(__namedParameters: CreateRollupFetchTransactionHashParams): Promise<`0x${string}`>
```

Creates a transaction hash for a Rollup contract by fetching the
RollupInitialized event from the contract's logs. Returns the transaction
hash as a String.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `CreateRollupFetchTransactionHashParams` |

#### Returns

`Promise`\<\`0x$\{string\}\`\>

#### Source

[src/createRollupFetchTransactionHash.ts:60](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupFetchTransactionHash.ts#L60)
