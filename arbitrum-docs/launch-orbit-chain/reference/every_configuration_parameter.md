# SDK Reference Guide for Orbit Chain Configuration Parameters

## Introduction

This guide provides a detailed explanation of the configuration parameters needed to deploy an Orbit Rollup chain using the Orbit SDK. By the end of this guide, intermediate to advanced developers with a solid understanding of blockchain fundamentals will know how to configure an Orbit Rollup chain.

## Configuring an Orbit Chain

### Important Parameters

Below are the most critical parameters for configuring an Orbit Rollup chain. Each parameter is explained with its type, whether it's optional, and a detailed description.

#### `DataAvailabilityCommittee`

This parameter determines whether an Orbit chain can be a Rollup or an Anytrust chain.

| Name                       | Type    | Optional | Description                                                                                                                                                              |
|----------------------------|---------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| DataAvailabilityCommittee  | boolean | No       | This parameter specifies whether a Data Availability Committee is used. If set to `true`, the chain operates as an Anytrust chain. If set to `false`, it operates as a Rollup chain. |

#### `chainId`

This parameter sets the unique identifier for the chain.

| Name    | Type   | Optional | Description                                             |
|---------|--------|----------|---------------------------------------------------------|
| chainId | uint64 | No       | The unique identifier for the chain, used in all chain transactions. |

#### `InitialChainOwner`

This parameter defines the initial owner of the chain.

| Name              | Type    | Optional | Description                                                                  |
|-------------------|---------|----------|------------------------------------------------------------------------------|
| InitialChainOwner | Address | No       | The address of the initial owner of the chain, responsible for managing the chain settings initially. |

#### `MaxCodeSize`

This parameter sets the maximum size for the contract code.

| Name       | Type | Optional | Description                                                                                  |
|------------|------|----------|----------------------------------------------------------------------------------------------|
| MaxCodeSize | uint | No       | Specifies the maximum size, in bytes, for any contract code on the chain. |

#### `MaxInitCodeSize`

This parameter sets the maximum size for the initialization code of contracts.

| Name           | Type | Optional | Description                                                                                      |
|----------------|------|----------|--------------------------------------------------------------------------------------------------|
| MaxInitCodeSize | uint | No       | Specifies the maximum size, in bytes, for any initialization code of contracts on the chain. |

### `chainConfig` Object Parameter

The `chainConfig` object encompasses several Ethereum and Arbitrum-specific configurations. Here is a detailed breakdown of its structure:

```json
{
  "homesteadBlock": 0,
  "daoForkBlock": null,
  "daoForkSupport": true,
  "eip150Block": 0,
  "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "eip155Block": 0,
  "eip158Block": 0,
  "byzantiumBlock": 0,
  "constantinopleBlock": 0,
  "petersburgBlock": 0,
  "istanbulBlock": 0,
  "muirGlacierBlock": 0,
  "berlinBlock": 0,
  "londonBlock": 0,
  "clique": {
    "period": 0,
    "epoch": 0
  },
  "arbitrum": {
    "EnableArbOS": true,
    "AllowDebugPrecompiles": false,
    "DataAvailabilityCommittee": true,
    "InitialArbOSVersion": 20,
    "GenesisBlockNum": 0,
    "MaxCodeSize": 24576,
    "MaxInitCodeSize": 49152,
    "InitialChainOwner": "0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0"
  },
  "chainId": 97400766948
}
```

#### Ethereum-specific Configuration

| Name               | Type      | Optional | Description                                                                                     |
|--------------------|-----------|----------|-------------------------------------------------------------------------------------------------|
| homesteadBlock     | uint      | No       | Block number at which Homestead hard fork was enabled.                                          |
| daoForkBlock       | uint/null | Yes      | Block number at which DAO hard fork was enabled (or `null` if unsupported).                     |
| daoForkSupport     | boolean   | No       | Specifies if the DAO hard fork is supported.                                                    |
| eip150Block        | uint      | No       | Block number at which EIP-150 was enabled.                                                      |
| eip150Hash         | string    | No       | Block hash of EIP-150 transition.                                                               |
| eip155Block        | uint      | No       | Block number at which EIP-155 was enabled.                                                      |
| eip158Block        | uint      | No       | Block number at which EIP-158 was enabled.                                                      |
| byzantiumBlock     | uint      | No       | Block number at which Byzantium hard fork was enabled.                                          |
| constantinopleBlock| uint      | No       | Block number at which Constantinople hard fork was enabled.                                     |
| petersburgBlock    | uint      | No       | Block number at which Petersburg hard fork was enabled.                                         |
| istanbulBlock      | uint      | No       | Block number at which Istanbul hard fork was enabled.                                           |
| muirGlacierBlock   | uint      | No       | Block number at which Muir Glacier hard fork was enabled.                                       |
| berlinBlock        | uint      | No       | Block number at which Berlin hard fork was enabled.                                             |
| londonBlock        | uint      | No       | Block number at which London hard fork was enabled.                                             |
| clique             | object    | No       | Configuration for Clique consensus mechanism.                                                   |
| clique.period      | uint      | No       | Block period for Clique.                                                                        |
| clique.epoch       | uint      | No       | Epoch length for Clique.                                                                        |

#### Arbitrum-specific Configuration

| Name                      | Type    | Optional | Description                                                                                      |
|---------------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| EnableArbOS               | boolean | No       | Specifies if ArbOS is enabled.                                                                   |
| AllowDebugPrecompiles     | boolean | No       | Allows precompiled contracts for debugging purposes.                                             |
| DataAvailabilityCommittee | boolean | No       | Specifies if the Data Availability Committee is enabled.                                         |
| InitialArbOSVersion       | uint    | No       | Initial version number of ArbOS.                                                                 |
| GenesisBlockNum           | uint    | No       | Block number of the Genesis block.                                                               |
| MaxCodeSize               | uint    | No       | Maximum size of the contract code in bytes.                                                      |
| MaxInitCodeSize           | uint    | No       | Maximum size of the initialization code of contracts in bytes.                                   |
| InitialChainOwner         | Address | No       | Address of the initial owner of the chain.                                                       |

### Example Configuration

Below is an example configuration for an Orbit Rollup chain using the Orbit SDK:

```json
{
  "confirmPeriodBlocks": "150",
  "extraChallengeTimeBlocks": "0",
  "stakeToken": "0x0000000000000000000000000000000000000000",
  "baseStake": "100000000000000000",
  "wasmModuleRoot": "0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4",
  "loserStakeEscrow": "0x0000000000000000000000000000000000000000",
  "genesisBlockNum": "0",
  "sequencerInboxMaxTimeVariation": {
    "delayBlocks": "5760",
    "futureBlocks": "48",
    "delaySeconds": "86400",
    "futureSeconds": "3600"
  },
  "chainId": "97400766948",
  "owner": "0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0",
  "chainConfig": {
    "homesteadBlock": 0,
    "daoForkBlock": null,
    "daoForkSupport": true,
    "eip150Block": 0,
    "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "clique": {
      "period": 0,
      "epoch": 0
    },
    "arbitrum": {
      "EnableArbOS": true,
      "AllowDebugPrecompiles": false,
      "DataAvailabilityCommittee": true,
      "InitialArbOSVersion": 20,
      "GenesisBlockNum": 0,
      "MaxCodeSize": 24576,
      "MaxInitCodeSize": 49152,
      "InitialChainOwner": "0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0"
    },
    "chainId": 97400766948
  }
}
```
