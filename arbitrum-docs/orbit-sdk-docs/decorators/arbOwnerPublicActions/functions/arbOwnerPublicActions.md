---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbOwnerPublicActions<TTransport, TChain>(client: object): ArbOwnerPublicActions<TChain>;
```

Returns an object with two functions: `arbOwnerReadContract` and
`arbOwnerPrepareTransactionRequest`, which interact with the ArbOwner
contract by reading contract data and preparing transaction requests,
respectively.

## Type parameters

| Type parameter                                                                                                 | Value                                                                                   |
| :------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `TTransport` _extends_ `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` _extends_ `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>                                  | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>                              |

## Parameters

| Parameter | Type     |
| :-------- | :------- |
| `client`  | `object` |

## Returns

`ArbOwnerPublicActions`\<`TChain`\>

## Source

[src/decorators/arbOwnerPublicActions.ts:33](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/arbOwnerPublicActions.ts#L33)
