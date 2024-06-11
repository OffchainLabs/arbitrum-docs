---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# prepareChainConfig

## Type Aliases

### PrepareChainConfigParams

> **PrepareChainConfigParams**: `Pick` \<[`ChainConfig`](types/ChainConfig.md#chainconfig), `"chainId"`\> & `Partial`\<`Omit` \<[`ChainConfig`](types/ChainConfig.md#chainconfig), `"chainId"` \| `"arbitrum"`\>\> & `object`

#### Type declaration

##### arbitrum

> **arbitrum**: `Pick` \<[`ChainConfigArbitrumParams`](types/ChainConfig.md#chainconfigarbitrumparams), `"InitialChainOwner"`\> & `Partial`\<`Omit` \<[`ChainConfigArbitrumParams`](types/ChainConfig.md#chainconfigarbitrumparams), `"InitialChainOwner"`\>\>

#### Source

[src/prepareChainConfig.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/prepareChainConfig.ts#L41)

## Variables

### defaults

> `const` **defaults**: `object`

The defaults object contains default values for various blockchain
parameters, such as block numbers and configuration settings. It includes
values for Ethereum mainnet hard forks like Homestead, Constantinople, and
Istanbul, as well as specific settings for the Arbitrum layer 2 solution. The
prepareChainConfig function utilizes these defaults to create a complete
ChainConfig object with the specified parameters.

#### Type declaration

##### arbitrum

> **arbitrum**: `object`

##### arbitrum.AllowDebugPrecompiles

> **AllowDebugPrecompiles**: `boolean` = `false`

##### arbitrum.DataAvailabilityCommittee

> **DataAvailabilityCommittee**: `boolean` = `false`

##### arbitrum.EnableArbOS

> **EnableArbOS**: `boolean` = `true`

##### arbitrum.GenesisBlockNum

> **GenesisBlockNum**: `number` = `0`

##### arbitrum.InitialArbOSVersion

> **InitialArbOSVersion**: `number` = `20`

##### arbitrum.MaxCodeSize

> **MaxCodeSize**: `number` = `24_576`

##### arbitrum.MaxInitCodeSize

> **MaxInitCodeSize**: `number` = `49_152`

##### berlinBlock

> **berlinBlock**: `number` = `0`

##### byzantiumBlock

> **byzantiumBlock**: `number` = `0`

##### clique

> **clique**: `object`

##### clique.epoch

> **epoch**: `number` = `0`

##### clique.period

> **period**: `number` = `0`

##### constantinopleBlock

> **constantinopleBlock**: `number` = `0`

##### daoForkBlock

> **daoForkBlock**: `null` = `null`

##### daoForkSupport

> **daoForkSupport**: `boolean` = `true`

##### eip150Block

> **eip150Block**: `number` = `0`

##### eip150Hash

> **eip150Hash**: `string` = `'0x0000000000000000000000000000000000000000000000000000000000000000'`

##### eip155Block

> **eip155Block**: `number` = `0`

##### eip158Block

> **eip158Block**: `number` = `0`

##### homesteadBlock

> **homesteadBlock**: `number` = `0`

##### istanbulBlock

> **istanbulBlock**: `number` = `0`

##### londonBlock

> **londonBlock**: `number` = `0`

##### muirGlacierBlock

> **muirGlacierBlock**: `number` = `0`

##### petersburgBlock

> **petersburgBlock**: `number` = `0`

#### Source

[src/prepareChainConfig.ts:11](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/prepareChainConfig.ts#L11)

## Functions

### prepareChainConfig()

> **prepareChainConfig**(`params`): [`ChainConfig`](types/ChainConfig.md#chainconfig)

Merges the default chain configuration with the provided parameters.

This function takes in specific configurations for the Clique and Arbitrum
consensus algorithms and returns a complete [ChainConfig](types/ChainConfig.md#chainconfig) object with
the updated values.

#### Parameters

• **params**: [`PrepareChainConfigParams`](prepareChainConfig.md#preparechainconfigparams)

The parameters to merge with defaults.

#### Returns

[`ChainConfig`](types/ChainConfig.md#chainconfig)

The complete chain configuration object.

#### Example

```ts
const customConfig = prepareChainConfig({
  chainId: 42161,
  clique: { period: 15, epoch: 30000 },
  arbitrum: { InitialChainOwner: '0xYourAddressHere' },
});
```

#### Source

[src/prepareChainConfig.ts:78](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/prepareChainConfig.ts#L78)
