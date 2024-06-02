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
  retryableGasOverrides?: TransactionRequestRetryableGasOverrides,
): Promise<CreateTokenBridgeGetInputsResult>;
```

Returns a CreateTokenBridgeGetInputsResult object containing inputs
required for creating a token bridge.

## Parameters

| Parameter                     | Type                                      |
| :---------------------------- | :---------------------------------------- |
| `l1DeployerAddress`           | `string`                                  |
| `l1PublicClient`              | `object`                                  |
| `l2PublicClient`              | `object`                                  |
| `l1TokenBridgeCreatorAddress` | `string`                                  |
| `rollupAddress`               | `string`                                  |
| `retryableGasOverrides`?      | `TransactionRequestRetryableGasOverrides` |

## Returns

`Promise`\<`CreateTokenBridgeGetInputsResult`\>

## Source

[src/createTokenBridge-ethers.ts:38](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridge-ethers.ts#L38)
