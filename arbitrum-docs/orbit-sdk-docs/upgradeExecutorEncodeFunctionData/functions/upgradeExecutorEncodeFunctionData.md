---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: upgradeExecutorEncodeFunctionData()

> **upgradeExecutorEncodeFunctionData**\<`TFunctionName`\>(`params`): `string`

Encodes a function call to be sent through the UpgradeExecutor

## Type parameters

• **TFunctionName** *extends* `unknown`

## Parameters

• **params**: \{ \[K in string \| number \| symbol\]: Omit\<EncodeFunctionDataParameters\<any, TFunctionName, any\>, "abi"\>\[K\] \}

Parameters for encoding function data

## Returns

`string`

Encoded function data

## Source

[src/upgradeExecutorEncodeFunctionData.ts:49](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/upgradeExecutorEncodeFunctionData.ts#L49)
