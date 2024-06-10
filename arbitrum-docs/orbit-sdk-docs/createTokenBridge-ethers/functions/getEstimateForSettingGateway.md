---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function getEstimateForSettingGateway(
   l1ChainOwnerAddress: `0x${string}`, 
   l1UpgradeExecutorAddress: `0x${string}`, 
   l1GatewayRouterAddress: `0x${string}`, 
   setGatewaysCalldata: `0x${string}`, 
   parentChainPublicClient: object, 
orbitChainPublicClient: object): Promise<object>
```

## Parameters

| Parameter | Type |
| :------ | :------ |
| `l1ChainOwnerAddress` | \`0x$\{string\}\` |
| `l1UpgradeExecutorAddress` | \`0x$\{string\}\` |
| `l1GatewayRouterAddress` | \`0x$\{string\}\` |
| `setGatewaysCalldata` | \`0x$\{string\}\` |
| `parentChainPublicClient` | `object` |
| `orbitChainPublicClient` | `object` |

## Returns

`Promise`\<`object`\>

| Member | Type | Value |
| :------ | :------ | :------ |
| `deposit` | `bigint` | ... |
| `gasLimit` | `bigint` | ... |
| `maxFeePerGas` | `bigint` | ... |
| `maxSubmissionCost` | `bigint` | ... |

## Source

[src/createTokenBridge-ethers.ts:192](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridge-ethers.ts#L192)
