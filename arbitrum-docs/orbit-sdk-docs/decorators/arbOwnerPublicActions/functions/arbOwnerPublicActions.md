---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbOwnerPublicActions<TTransport, TChain>(client: object): ArbOwnerPublicActions<TChain>
```

Returns an object with two functions: `arbOwnerReadContract` and
`arbOwnerPrepareTransactionRequest`, which interact with the ArbOwner
contract by reading contract data and preparing transaction requests,
respectively.

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |

## Returns

`ArbOwnerPublicActions`\<`TChain`\>

## Source

[src/decorators/arbOwnerPublicActions.ts:33](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/decorators/arbOwnerPublicActions.ts#L33)
