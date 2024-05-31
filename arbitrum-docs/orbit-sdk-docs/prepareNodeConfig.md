[Documentation](README.md) / prepareNodeConfig

## Functions

### prepareNodeConfig()

```ts
function prepareNodeConfig(__namedParameters: PrepareNodeConfigParams): NodeConfig;
```

prepareNodeConfig prepares and returns a [NodeConfig](types/NodeConfig.md#nodeconfig) based on the
provided parameters such as chain name, configuration, core contracts,
private keys, parent chain information, and RPC URLs. It handles the creation
of a configuration object with specific properties for the given chain,
parent chain connection, HTTP settings, node behavior, execution details, and
additional configurations if required.

#### Parameters

| Parameter           | Type                      |
| :------------------ | :------------------------ |
| `__namedParameters` | `PrepareNodeConfigParams` |

#### Returns

[`NodeConfig`](types/NodeConfig.md#nodeconfig)

#### Source

[src/prepareNodeConfig.ts:72](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/prepareNodeConfig.ts#L72)
