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

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined` = [`mainnet`](../chains.md#mainnet) \| `undefined`

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

[decorators/arbGasInfoPublicActions.ts:10](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/arbGasInfoPublicActions.ts#L10)

## Functions

### arbGasInfoPublicActions()

> **arbGasInfoPublicActions**\<`TTransport`, `TChain`\>(`client`): [`ArbGasInfoPublicActions`](arbGasInfoPublicActions.md#arbgasinfopublicactionstchain)\<`TChain`\>

#### Type parameters

• **TTransport** *extends* `Transport` = `Transport`

• **TChain** *extends* `unknown` = `any`

#### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

#### Returns

[`ArbGasInfoPublicActions`](arbGasInfoPublicActions.md#arbgasinfopublicactionstchain)\<`TChain`\>

#### Source

[decorators/arbGasInfoPublicActions.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/arbGasInfoPublicActions.ts#L16)
