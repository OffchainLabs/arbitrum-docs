```ts
function getArbOSVersion(arbitrumPublicClient: object): Promise<number>
```

Returns the the ArbOS version from the provider passed in parameter.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `arbitrumPublicClient` | `object` | viem public client |

## Returns

`Promise`\<`number`\>

the ArbOS version

## Throws

if the provider is not an arbitrum chain

## Source

[src/utils/getArbOSVersion.ts:11](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/efea61c53fc08d3a6a336315cc447bc7613aada5/src/utils/getArbOSVersion.ts#L11)
