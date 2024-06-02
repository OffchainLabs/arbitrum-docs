---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function getArbOSVersion(arbitrumPublicClient: object): Promise<number>;
```

Returns the the ArbOS version from the provider passed in parameter.

## Parameters

| Parameter              | Type     | Description        |
| :--------------------- | :------- | :----------------- |
| `arbitrumPublicClient` | `object` | viem public client |

## Returns

`Promise`\<`number`\>

the ArbOS version

## Throws

if the provider is not an arbitrum chain

## Source

[src/utils/getArbOSVersion.ts:11](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/utils/getArbOSVersion.ts#L11)
