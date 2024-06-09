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
  orbitChainPublicClient: object,
): Promise<object>;
```

Returns an estimate for setting a token gateway in the router.

## Parameters

| Parameter                  | Type              |
| :------------------------- | :---------------- |
| `l1ChainOwnerAddress`      | \`0x$\{string\}\` |
| `l1UpgradeExecutorAddress` | \`0x$\{string\}\` |
| `l1GatewayRouterAddress`   | \`0x$\{string\}\` |
| `setGatewaysCalldata`      | \`0x$\{string\}\` |
| `parentChainPublicClient`  | `object`          |
| `orbitChainPublicClient`   | `object`          |

## Returns

`Promise`\<`object`\>

| Member              | Type     | Value |
| :------------------ | :------- | :---- |
| `deposit`           | `bigint` | ...   |
| `gasLimit`          | `bigint` | ...   |
| `maxFeePerGas`      | `bigint` | ...   |
| `maxSubmissionCost` | `bigint` | ...   |

## Source

[src/createTokenBridge-ethers.ts:229](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridge-ethers.ts#L229)
