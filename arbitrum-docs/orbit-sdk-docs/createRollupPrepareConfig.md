---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareConfig

## Type Aliases

### CreateRollupPrepareConfigResult

> **CreateRollupPrepareConfigResult**: [`CreateRollupFunctionInputs`](types/createRollupTypes.md#createrollupfunctioninputs)\[`0`\]\[`"config"`\]

#### Source

[src/createRollupPrepareConfig.ts:9](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareConfig.ts#L9)

## Functions

### ~~createRollupPrepareConfig()~~

> **createRollupPrepareConfig**(`createRollupPrepareConfigParams`): [`CreateRollupPrepareConfigResult`](createRollupPrepareConfig.md#createrollupprepareconfigresult)

Prepares the configuration for creating a Rollup deployment.

#### Parameters

• **createRollupPrepareConfigParams**: `CreateRollupPrepareConfigParams`

The parameters for preparing the Rollup config

#### Returns

[`CreateRollupPrepareConfigResult`](createRollupPrepareConfig.md#createrollupprepareconfigresult)

- The prepared Rollup configuration

#### Deprecated

Will be removed in a future release. Please use [createRollupPrepareDeploymentParamsConfig](createRollupPrepareDeploymentParamsConfig.md#createrolluppreparedeploymentparamsconfig) instead.

#### Example

```ts
const config = createRollupPrepareConfig({
  chainId: 1234n,
  owner: '0xYourAddress',
});
console.log(config);
```

#### Source

[src/createRollupPrepareConfig.ts:38](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareConfig.ts#L38)
