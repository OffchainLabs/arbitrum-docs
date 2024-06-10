---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgeGetInputs(
   l1DeployerAddress: string, 
   l1PublicClient: object, 
   l2PublicClient: object, 
   l1TokenBridgeCreatorAddress: string, 
   rollupAddress: string, 
retryableGasOverrides?: TransactionRequestRetryableGasOverrides): Promise<CreateTokenBridgeGetInputsResult>
```

## Parameters

| Parameter | Type |
| :------ | :------ |
| `l1DeployerAddress` | `string` |
| `l1PublicClient` | `object` |
| `l2PublicClient` | `object` |
| `l1TokenBridgeCreatorAddress` | `string` |
| `rollupAddress` | `string` |
| `retryableGasOverrides`? | [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md) |

## Returns

`Promise` \<[`CreateTokenBridgeGetInputsResult`](../type-aliases/CreateTokenBridgeGetInputsResult.md)\>

## Source

[src/createTokenBridge-ethers.ts:34](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridge-ethers.ts#L34)
