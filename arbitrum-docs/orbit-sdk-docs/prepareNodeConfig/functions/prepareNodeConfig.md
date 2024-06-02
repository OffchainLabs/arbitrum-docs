---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function prepareNodeConfig(__namedParameters: PrepareNodeConfigParams): NodeConfig
```

prepareNodeConfig prepares the configuration object for a node based on the
provided parameters and returns a [NodeConfig](../../types/NodeConfig.generated/type-aliases/NodeConfig.md). It handles setting up
various configurations such as chain information, parent chain details, HTTP
settings, node features like sequencer and batch poster, execution
parameters, and data availability settings if applicable.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `PrepareNodeConfigParams` |

## Returns

[`NodeConfig`](../../types/NodeConfig.generated/type-aliases/NodeConfig.md)

## Source

[src/prepareNodeConfig.ts:71](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/prepareNodeConfig.ts#L71)
