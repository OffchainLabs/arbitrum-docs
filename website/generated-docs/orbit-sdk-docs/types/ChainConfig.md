---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# types/ChainConfig

## Type Aliases

### ChainConfig

> **ChainConfig**: `object`

#### Type declaration

##### arbitrum

> **arbitrum**: [`ChainConfigArbitrumParams`](ChainConfig.md#chainconfigarbitrumparams)

##### berlinBlock

> **berlinBlock**: `number`

##### byzantiumBlock

> **byzantiumBlock**: `number`

##### chainId

> **chainId**: `number`

##### clique

> **clique**: `object`

##### clique.epoch

> **epoch**: `number`

##### clique.period

> **period**: `number`

##### constantinopleBlock

> **constantinopleBlock**: `number`

##### daoForkBlock

> **daoForkBlock**: `null`

##### daoForkSupport

> **daoForkSupport**: `boolean`

##### eip150Block

> **eip150Block**: `number`

##### eip150Hash

> **eip150Hash**: `string`

##### eip155Block

> **eip155Block**: `number`

##### eip158Block

> **eip158Block**: `number`

##### homesteadBlock

> **homesteadBlock**: `number`

##### istanbulBlock

> **istanbulBlock**: `number`

##### londonBlock

> **londonBlock**: `number`

##### muirGlacierBlock

> **muirGlacierBlock**: `number`

##### petersburgBlock

> **petersburgBlock**: `number`

#### Source

[types/ChainConfig.ts:14](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/ChainConfig.ts#L14)

***

### ChainConfigArbitrumParams

> **ChainConfigArbitrumParams**: `object`

#### Type declaration

##### AllowDebugPrecompiles

> **AllowDebugPrecompiles**: `boolean`

##### DataAvailabilityCommittee

> **DataAvailabilityCommittee**: `boolean`

##### EnableArbOS

> **EnableArbOS**: `boolean`

##### GenesisBlockNum

> **GenesisBlockNum**: `number`

##### InitialArbOSVersion

> **InitialArbOSVersion**: `number`

##### InitialChainOwner

> **InitialChainOwner**: [`mainnet`](../chains.md#mainnet)

##### MaxCodeSize

> **MaxCodeSize**: `number`

##### MaxInitCodeSize

> **MaxInitCodeSize**: `number`

#### Source

[types/ChainConfig.ts:3](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/types/ChainConfig.ts#L3)
