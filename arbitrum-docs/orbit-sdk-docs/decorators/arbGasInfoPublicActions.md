---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# decorators/arbGasInfoPublicActions

## Type Aliases

### ArbGasInfoPublicActions\<TChain\>

> **ArbGasInfoPublicActions**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

#### Type declaration

##### arbGasInfoReadContract()

> **arbGasInfoReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`ArbGasInfoReadContractReturnType`](../arbGasInfoReadContract.md#arbgasinforeadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

###### Type parameters

• **TFunctionName** *extends* [`ArbGasInfoFunctionName`](../arbGasInfoReadContract.md#arbgasinfofunctionname)

###### Parameters

• **args**: [`ArbGasInfoReadContractParameters`](../arbGasInfoReadContract.md#arbgasinforeadcontractparameterstfunctionname)\<`TFunctionName`\>

###### Returns

`Promise` \<[`ArbGasInfoReadContractReturnType`](../arbGasInfoReadContract.md#arbgasinforeadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[src/decorators/arbGasInfoPublicActions.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/arbGasInfoPublicActions.ts#L10)

## Functions

### arbGasInfoPublicActions()

> **arbGasInfoPublicActions**\<`TTransport`, `TChain`\>(`client`): [`ArbGasInfoPublicActions`](arbGasInfoPublicActions.md#arbgasinfopublicactionstchain)\<`TChain`\>

Returns an object with a method `arbGasInfoReadContract` that allows for
reading contract information related to gas costs on the Arbitrum network.

#### Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

The type of transport used by the PublicClient.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of chain, can be defined or undefined.

#### Parameters

• **client**

The public client for the specified transport and chain.

#### Returns

[`ArbGasInfoPublicActions`](arbGasInfoPublicActions.md#arbgasinfopublicactionstchain)\<`TChain`\>

An object containing the `arbGasInfoReadContract` method.

#### Source

[src/decorators/arbGasInfoPublicActions.ts:25](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/arbGasInfoPublicActions.ts#L25)
