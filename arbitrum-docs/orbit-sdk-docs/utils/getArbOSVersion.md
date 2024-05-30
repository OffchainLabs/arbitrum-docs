---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Functions

### getArbOSVersion()

```ts
function getArbOSVersion(arbitrumPublicClient: object): Promise<number>
```

Returns the the ArbOS version from the provider passed in parameter.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `arbitrumPublicClient` | `object` | viem public client |

#### Returns

`Promise`\<`number`\>

the ArbOS version

#### Throws

if the provider is not an arbitrum chain

#### Source

[src/utils/getArbOSVersion.ts:11](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/utils/getArbOSVersion.ts#L11)
