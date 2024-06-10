---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function deployTokenBridgeCreator(__namedParameters: object): Promise<Address>
```

Deploys a Token Bridge Creator contract on the specified public client
network and returns the address of the deployed contract.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.publicClient` | `object` |

## Returns

`Promise`\<`Address`\>

## Source

[src/createTokenBridge-testHelpers.ts:14](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridge-testHelpers.ts#L14)
