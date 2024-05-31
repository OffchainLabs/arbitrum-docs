[Documentation](README.md) / createTokenBridge-ethers

## Functions

### createTokenBridgeGetInputs()

```ts
function createTokenBridgeGetInputs(
   l1DeployerAddress: string, 
   l1PublicClient: object, 
   l2PublicClient: object, 
   l1TokenBridgeCreatorAddress: string, 
   rollupAddress: string, 
retryableGasOverrides?: TransactionRequestRetryableGasOverrides): Promise<CreateTokenBridgeGetInputsResult>
```

createTokenBridgeGetInputs returns a CreateTokenBridgeGetInputsResult.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `l1DeployerAddress` | `string` |
| `l1PublicClient` | `object` |
| `l2PublicClient` | `object` |
| `l1TokenBridgeCreatorAddress` | `string` |
| `rollupAddress` | `string` |
| `retryableGasOverrides`? | `TransactionRequestRetryableGasOverrides` |

#### Returns

`Promise`\<`CreateTokenBridgeGetInputsResult`\>

#### Source

[src/createTokenBridge-ethers.ts:38](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridge-ethers.ts#L38)

***

### getEstimateForSettingGateway()

```ts
function getEstimateForSettingGateway(
   l1ChainOwnerAddress: `0x${string}`, 
   l1UpgradeExecutorAddress: `0x${string}`, 
   l1GatewayRouterAddress: `0x${string}`, 
   setGatewaysCalldata: `0x${string}`, 
   parentChainPublicClient: object, 
orbitChainPublicClient: object): Promise<object>
```

getEstimateForSettingGateway estimates the gas cost for setting a token
gateway in the router.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `l1ChainOwnerAddress` | \`0x$\{string\}\` |
| `l1UpgradeExecutorAddress` | \`0x$\{string\}\` |
| `l1GatewayRouterAddress` | \`0x$\{string\}\` |
| `setGatewaysCalldata` | \`0x$\{string\}\` |
| `parentChainPublicClient` | `object` |
| `orbitChainPublicClient` | `object` |

#### Returns

`Promise`\<`object`\>

| Member | Type | Value |
| :------ | :------ | :------ |
| `deposit` | `bigint` | ... |
| `gasLimit` | `bigint` | ... |
| `maxFeePerGas` | `bigint` | ... |
| `maxSubmissionCost` | `bigint` | ... |

#### Source

[src/createTokenBridge-ethers.ts:209](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridge-ethers.ts#L209)
