---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: arbOwnerPublicActions()

> **arbOwnerPublicActions**\<`TTransport`, `TChain`\>(`client`): [`ArbOwnerPublicActions`](../type-aliases/ArbOwnerPublicActions.md)\<`TChain`\>

Returns an object with two functions: `arbOwnerReadContract` and
`arbOwnerPrepareTransactionRequest`, which interact with the ArbOwner
contract by reading contract data and preparing transaction requests,
respectively.

## Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

## Parameters

• **client**

The public client used to interact with the blockchain.

## Returns

[`ArbOwnerPublicActions`](../type-aliases/ArbOwnerPublicActions.md)\<`TChain`\>

An object containing the functions to read contract data and prepare transaction requests.

## Example

```ts
const publicClient = new PublicClient(...);
const actions = arbOwnerPublicActions(publicClient);

const readResult = await actions.arbOwnerReadContract({
  functionName: 'someFunction',
  args: [...],
});

const txRequest = await actions.arbOwnerPrepareTransactionRequest({
  functionName: 'someOtherFunction',
  args: [...],
});
```

## Source

[src/decorators/arbOwnerPublicActions.ts:51](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/arbOwnerPublicActions.ts#L51)
