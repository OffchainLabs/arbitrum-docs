[Documentation](../README.md) / utils/getArbOSVersion

## Functions

### getArbOSVersion()

```ts
function getArbOSVersion(arbitrumPublicClient: object): Promise<number>;
```

Returns the the ArbOS version from the provider passed in parameter.

#### Parameters

| Parameter              | Type     | Description        |
| :--------------------- | :------- | :----------------- |
| `arbitrumPublicClient` | `object` | viem public client |

#### Returns

`Promise`\<`number`\>

the ArbOS version

#### Throws

if the provider is not an arbitrum chain

#### Source

[src/utils/getArbOSVersion.ts:11](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/getArbOSVersion.ts#L11)
