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

[src/createTokenBridge-ethers.ts:229](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridge-ethers.ts#L229)
