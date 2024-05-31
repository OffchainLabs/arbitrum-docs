---
title: 'Orbit SDK parameters reference guide'
sidebar_label: 'Parameters'
description: 'List of the most important parameters of the Orbit SDK '
author: anegg0
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
user_story: As a current or prospective Orbit chain deployer, I need to understand what parameters I can use with the Orbit SDK.
content_type: reference
---

This page references every parameter used to configure your Orbit chain.

Before diving into individual parameters, here is an example representing all the parameters. The outlined parameters are important ones.

```json {15,39,42,43,44}
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
    }
  }
}
```

You can inspect our code source for all these parameters [default values](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1f251f76a55bc1081f50938b0aa9f7965660ebf7/src/prepareChainConfig.ts#L3-L31).

### Key Parameters Explanation

#### DataAvailabilityCommittee

- **Type**: `boolean`
- **Description**: This parameter determines whether the Orbit chain functions as a Rollup or an AnyTrust chain. If `true`, the chain relies on a Data Availability Committee (DAC) to ensure data availability, classifying it as an AnyTrust chain. If `false`, it utilizes the standard L2 Rollup architecture, depending on its parent chain for data availability.

#### `chainId`

- **Type**: `uint64`
- **Description**: A unique identifier for the blockchain. This value ensures network uniqueness to prevent replay attacks across different networks.

#### InitialChainOwner

- **Type**: `Address`
- **Description**: Sets the initial owner of the chain, who has administrative control over the chain's parameters.

#### MaxCodeSize

- **Type**: `uint32`
- **Description**: Defines the maximum allowed size for contract code on the chain, e.g., Ethereum mainnet has a limit of 24,576 Bytes.

#### MaxInitCodeSize

- **Type**: `uint32`
- **Description**: Similar to `MaxCodeSize`, defines the maximum size for your Orbit chain's **initialization** code. e.g., Ethereum mainnet limit is 49,152 Bytes.

### Additional Parameters to consider

| **Name**                         | **Type**  | **Optional** | **Description**                                                                                                                                   |
| -------------------------------- | --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `confirmPeriodBlocks`            | `uint64`  | No           | Number of blocks required to confirm transactions.                                                                                                |
| `extraChallengeTimeBlocks`       | `uint64`  | No           | Additional time in blocks for challenge periods. Defaults to 0 if unnecessary.                                                                    |
| `stakeToken`                     | `Address` | No           | Address of the token used for staking.                                                                                                            |
| `baseStake`                      | `uint256` | No           | Minimum stake required to participate in the network.                                                                                             |
| `wasmModuleRoot`                 | `Hash`    | No           | Root of the WebAssembly module used for execution.                                                                                                |
| `loserStakeEscrow`               | `Address` | No           | Address where the losing stakes will be escrowed.                                                                                                 |
| `genesisBlockNum`                | `uint64`  | No           | Number assigned to the genesis block.                                                                                                             |
| `sequencerInboxMaxTimeVariation` | `object`  | No           | Maximum time variations for the sequencer's inbox, with nested parameters for `delayBlocks`, `futureBlocks`, `delaySeconds`, and `futureSeconds`. |

### `chainConfig` Parameters

| **Name**              | **Type**  | **Optional** | **Description**                                                   |
| --------------------- | --------- | ------------ | ----------------------------------------------------------------- |
| `homesteadBlock`      | `uint64`  | No           | Block at which the Homestead `EIP` was activated.                 |
| `daoForkBlock`        | `uint64`  | Yes          | Block number for the DAO hard fork. Set to `null` if unsupported. |
| `daoForkSupport`      | `boolean` | No           | Indicates whether the chain supports the DAO fork.                |
| `eip150Block`         | `uint64`  | No           | Block number at which `EIP-150` was activated.                    |
| `eip150Hash`          | `Hash`    | Yes          | Hash used in `EIP-150`.                                           |
| `eip155Block`         | `uint64`  | No           | Block number at which `EIP-155` was activated.                    |
| `eip158Block`         | `uint64`  | No           | Block number at which `EIP-158` was activated.                    |
| `byzantiumBlock`      | `uint64`  | No           | Block number at which Byzantium fork was activated.               |
| `constantinopleBlock` | `uint64`  | No           | Block number at which Constantinople fork was activated.          |
| `petersburgBlock`     | `uint64`  | No           | Block number at which Petersburg fork was activated.              |
| `istanbulBlock`       | `uint64`  | No           | Block number at which Istanbul fork was activated.                |
| `muirGlacierBlock`    | `uint64`  | No           | Block number at which Muir Glacier fork was activated.            |
| `berlinBlock`         | `uint64`  | No           | Block number at which Berlin fork was activated.                  |
| `londonBlock`         | `uint64`  | No           | Block number at which London fork was activated.                  |
| clique                | `object`  | No           | Defines Clique parameters like `period` and `epoch`.              |

### `arbitrum` Parameters

| **Name**                    | **Type**  | **Optional** | **Description**                                                                                                        |
| --------------------------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `EnableArbOS`               | `boolean` | No           | Specifies if ArbOS should be enabled.                                                                                  |
| `AllowDebugPrecompiles`     | `boolean` | Yes          | Indicates if debug precompiles are allowed.                                                                            |
| `DataAvailabilityCommittee` | `boolean` | No           | Determines whether the Orbit chain functions as a Rollup or an AnyTrust chain based on data availability requirements. |
| `InitialArbOSVersion`       | `uint32`  | No           | Version of ArbOS at genesis.                                                                                           |
| `GenesisBlockNum`           | `uint64`  | No           | Block number assigned to the genesis block.                                                                            |
| `MaxCodeSize`               | `uint32`  | No           | Maximum allowed size for contract code on the chain.                                                                   |
| `MaxInitCodeSize`           | `uint32`  | No           | Maximum allowed size for the initial code used to deploy a contract.                                                   |
| `InitialChainOwner`         | `Address` | No           | Initial owner of the chain with administrative control over the parameters.                                            |
