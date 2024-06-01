[Documentation](../README.md) / decorators/arbOwnerPublicActions

## Functions

### arbOwnerPublicActions()

```ts
function arbOwnerPublicActions<TTransport, TChain>(client: object): ArbOwnerPublicActions<TChain>
```

Returns an object containing functions to interact with the ArbOwner contract
on the Arbitrum chain. The functions include "arbOwnerReadContract" for
reading contract data and "arbOwnerPrepareTransactionRequest" for preparing
transaction requests.

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TTransport` *extends* `Transport` | `Transport` |
| `TChain` *extends* `undefined` \| `Chain` | `undefined` \| `Chain` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |

#### Returns

`ArbOwnerPublicActions`\<`TChain`\>

#### Source

[src/decorators/arbOwnerPublicActions.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/decorators/arbOwnerPublicActions.ts#L33)
