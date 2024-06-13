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

[prepareChainConfig.ts:33](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/prepareChainConfig.ts#L33)

## Variables

### defaults

> `const` **defaults**: `object`

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

[prepareChainConfig.ts:3](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/prepareChainConfig.ts#L3)

## Functions

### prepareChainConfig()

> **prepareChainConfig**(`params`): [`ChainConfig`](types/ChainConfig.md#chainconfig)

#### Parameters

• **params**: [`PrepareChainConfigParams`](prepareChainConfig.md#preparechainconfigparams)

#### Returns

[`ChainConfig`](types/ChainConfig.md#chainconfig)

#### Source

[prepareChainConfig.ts:39](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/prepareChainConfig.ts#L39)
