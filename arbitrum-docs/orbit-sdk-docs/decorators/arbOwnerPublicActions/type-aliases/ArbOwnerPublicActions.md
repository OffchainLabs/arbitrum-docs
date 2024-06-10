---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbOwnerPublicActions<TChain>: object;
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TChain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member | Type |
| :------ | :------ |
| `arbOwnerPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: [`ArbOwnerPrepareTransactionRequestParameters`](../../../arbOwnerPrepareTransactionRequest/type-aliases/ArbOwnerPrepareTransactionRequestParameters.md)\<`TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\> |
| `arbOwnerReadContract` | \<`TFunctionName`\>(`args`: [`ArbOwnerReadContractParameters`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractParameters.md)\<`TFunctionName`\>) => `Promise` \<[`ArbOwnerReadContractReturnType`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbOwnerPublicActions.ts:15](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/decorators/arbOwnerPublicActions.ts#L15)
