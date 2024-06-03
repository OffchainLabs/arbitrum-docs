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

[src/prepareNodeConfig.ts:71](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/prepareNodeConfig.ts#L71)
