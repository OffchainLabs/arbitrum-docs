---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: ~~createRollupPrepareConfig()~~

> **createRollupPrepareConfig**(`createRollupPrepareConfigParams`): [`CreateRollupPrepareConfigResult`](../type-aliases/CreateRollupPrepareConfigResult.md)

Prepares the configuration for creating a Rollup deployment.

## Parameters

• **createRollupPrepareConfigParams**: `CreateRollupPrepareConfigParams`

The parameters for preparing the Rollup config

## Returns

[`CreateRollupPrepareConfigResult`](../type-aliases/CreateRollupPrepareConfigResult.md)

- The prepared Rollup configuration

## Deprecated

Will be removed in a future release. Please use [createRollupPrepareDeploymentParamsConfig](../../createRollupPrepareDeploymentParamsConfig/functions/createRollupPrepareDeploymentParamsConfig.md) instead.

## Example

```ts
const config = createRollupPrepareConfig({
  chainId: 1234n,
  owner: '0xYourAddress',
});
console.log(config);
```

## Source

[src/createRollupPrepareConfig.ts:38](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupPrepareConfig.ts#L38)
