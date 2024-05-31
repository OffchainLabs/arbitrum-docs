[Documentation](README.md) / arbOwnerReadContract

## Functions

### arbOwnerReadContract()

```ts
function arbOwnerReadContract<TChain, TFunctionName>(client: object, params: ArbOwnerReadContractParameters<TFunctionName>): Promise<ArbOwnerReadContractReturnType<TFunctionName>>
```

Reads data from a contract owned by the arbiter.

#### Type parameters

| Type parameter |
| :------ |
| `TChain` *extends* `undefined` \| `Chain` |
| `TFunctionName` *extends* 
  \| `"getAllChainOwners"`
  \| `"getInfraFeeAccount"`
  \| `"getNetworkFeeAccount"`
  \| `"isChainOwner"`
  \| `"getBrotliCompressionLevel"`
  \| `"getScheduledUpgrade"`
  \| `"rectifyChainOwner"` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | `ArbOwnerReadContractParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`ArbOwnerReadContractReturnType`\<`TFunctionName`\>\>

#### Source

[src/arbOwnerReadContract.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/arbOwnerReadContract.ts#L17)
