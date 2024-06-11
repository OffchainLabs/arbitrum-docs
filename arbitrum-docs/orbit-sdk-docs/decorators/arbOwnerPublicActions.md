---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# decorators/arbOwnerPublicActions

## Type Aliases

### ArbOwnerPublicActions\<TChain\>

> **ArbOwnerPublicActions**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

#### Type declaration

##### arbOwnerPrepareTransactionRequest()

> **arbOwnerPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

###### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](../arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestfunctionname)

###### Parameters

• **args**: [`ArbOwnerPrepareTransactionRequestParameters`](../arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

##### arbOwnerReadContract()

> **arbOwnerReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbOwnerReadContractReturnType`](../arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

###### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPublicFunctionName`](../arbOwnerReadContract.md#arbownerpublicfunctionname)

###### Parameters

• **args**: [`ArbOwnerReadContractParameters`](../arbOwnerReadContract.md#arbownerreadcontractparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise` \<[`ArbOwnerReadContractReturnType`](../arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[src/decorators/arbOwnerPublicActions.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/arbOwnerPublicActions.ts#L15)

## Functions

### arbOwnerPublicActions()

> **arbOwnerPublicActions**\<`TTransport`, `TChain`\>(`client`): [`ArbOwnerPublicActions`](arbOwnerPublicActions.md#arbownerpublicactionstchain)\<`TChain`\>

Returns an object with two functions: `arbOwnerReadContract` and
`arbOwnerPrepareTransactionRequest`, which interact with the ArbOwner
contract by reading contract data and preparing transaction requests,
respectively.

#### Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

#### Parameters

• **client**

The public client used to interact with the blockchain.

#### Returns

[`ArbOwnerPublicActions`](arbOwnerPublicActions.md#arbownerpublicactionstchain)\<`TChain`\>

An object containing the functions to read contract data and prepare transaction requests.

#### Example

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

#### Source

[src/decorators/arbOwnerPublicActions.ts:51](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/arbOwnerPublicActions.ts#L51)
