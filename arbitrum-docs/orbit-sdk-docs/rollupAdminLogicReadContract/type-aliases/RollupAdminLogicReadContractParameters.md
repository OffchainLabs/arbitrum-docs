---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: RollupAdminLogicReadContractParameters\<TFunctionName\>

> **RollupAdminLogicReadContractParameters**\<`TFunctionName`\>: `object` & `GetFunctionArgs` \<[`RollupAdminLogicAbi`](RollupAdminLogicAbi.md), `TFunctionName`\>

## Type declaration

### functionName

> **functionName**: `TFunctionName`

The name of the function to call on the RollupAdminLogic contract

### rollup

> **rollup**: `Address`

The address of the RollupAdminLogic contract

## Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](RollupAdminLogicFunctionName.md)

## Source

[src/rollupAdminLogicReadContract.ts:18](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/rollupAdminLogicReadContract.ts#L18)
