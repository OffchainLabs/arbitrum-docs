---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Variable: defaults

> `const` **defaults**: `object`

The defaults object contains default values for various blockchain
parameters, such as block numbers and configuration settings. It includes
values for Ethereum mainnet hard forks like Homestead, Constantinople, and
Istanbul, as well as specific settings for the Arbitrum layer 2 solution. The
prepareChainConfig function utilizes these defaults to create a complete
ChainConfig object with the specified parameters.

## Type declaration

### arbitrum

> **arbitrum**: `object`

### arbitrum.AllowDebugPrecompiles

> **AllowDebugPrecompiles**: `boolean` = `false`

### arbitrum.DataAvailabilityCommittee

> **DataAvailabilityCommittee**: `boolean` = `false`

### arbitrum.EnableArbOS

> **EnableArbOS**: `boolean` = `true`

### arbitrum.GenesisBlockNum

> **GenesisBlockNum**: `number` = `0`

### arbitrum.InitialArbOSVersion

> **InitialArbOSVersion**: `number` = `20`

### arbitrum.MaxCodeSize

> **MaxCodeSize**: `number` = `24_576`

### arbitrum.MaxInitCodeSize

> **MaxInitCodeSize**: `number` = `49_152`

### berlinBlock

> **berlinBlock**: `number` = `0`

### byzantiumBlock

> **byzantiumBlock**: `number` = `0`

### clique

> **clique**: `object`

### clique.epoch

> **epoch**: `number` = `0`

### clique.period

> **period**: `number` = `0`

### constantinopleBlock

> **constantinopleBlock**: `number` = `0`

### daoForkBlock

> **daoForkBlock**: `null` = `null`

### daoForkSupport

> **daoForkSupport**: `boolean` = `true`

### eip150Block

> **eip150Block**: `number` = `0`

### eip150Hash

> **eip150Hash**: `string` = `'0x0000000000000000000000000000000000000000000000000000000000000000'`

### eip155Block

> **eip155Block**: `number` = `0`

### eip158Block

> **eip158Block**: `number` = `0`

### homesteadBlock

> **homesteadBlock**: `number` = `0`

### istanbulBlock

> **istanbulBlock**: `number` = `0`

### londonBlock

> **londonBlock**: `number` = `0`

### muirGlacierBlock

> **muirGlacierBlock**: `number` = `0`

### petersburgBlock

> **petersburgBlock**: `number` = `0`

## Source

[src/prepareChainConfig.ts:11](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/prepareChainConfig.ts#L11)
