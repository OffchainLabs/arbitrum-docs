---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function deployTokenBridgeCreator(__namedParameters: object): Promise<Address>;
```

Deploys a Token Bridge Creator contract on the specified public client
network and returns the address of the deployed contract.

## Parameters

| Parameter                        | Type     |
| :------------------------------- | :------- |
| `__namedParameters`              | `object` |
| `__namedParameters.publicClient` | `object` |

## Returns

`Promise`\<`Address`\>

## Source

[src/createTokenBridge-testHelpers.ts:14](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridge-testHelpers.ts#L14)
