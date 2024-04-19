### Rollup deployment parameters

[`createRollup`](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/rollup/RollupCreator.sol#L107) is the function that will deploy your core contracts on the parent chain.
`createRollup` takes a complex input named `deployParams`defining the characteristics of an Orbit Rollup chain

The following will walk you through the methods and properties that you will use to configure your chain.

#### 1. RollupDeploymentParams struct

The `RollupDeploymentParams` Solidity struct includes key settings like the chain configuration (`Config`), validator addresses, maximum data size, the native token of the chain, and more.

```solidity {2,4,6}
struct RollupDeploymentParams {
    Config config;
    address batchPoster;
    address[] validators;
    uint256 maxDataSize;
    address nativeToken;
    bool deployFactoriesToL2;
    uint256 maxFeePerGasForRetryables;
}
```

#### 2. Config struct

The `Config` struct defines the chain's core settings, including block confirmation periods, stake parameters, and the chain ID.

```solidity {2,4,5,9}
struct Config {
    uint64 confirmPeriodBlocks;
    uint64 extraChallengeTimeBlocks;
    address stakeToken;
    uint256 baseStake;
    bytes32 wasmModuleRoot;
    address owner;
    address loserStakeEscrow;
    uint256 chainId;
    string chainConfig;
    uint64 genesisBlockNum;
    ISequencerInbox.MaxTimeVariation sequencerInboxMaxTimeVariation;
}
```

#### 3. MaxTimeVariation struct

This nested struct within `Config` specifies time variations related to block sequencing, providing control over block delay and future block settings.

```solidity
struct MaxTimeVariation {
    uint256 delayBlocks;
    uint256 futureBlocks;
    uint256 delaySeconds;
    uint256 futureSeconds;
}
```

#### 4. chainConfig

The `chainConfig` parameter within the `Config` struct allows you to customize your Orbit chain. It's a stringified `JSON` object containing various configuration options that dictate how the Orbit chain behaves and interacts with the parent chain network.

Here's a brief overview of `chainConfig`:

```json {2,24,26,28,29}
{
  chainId: number;
  homesteadBlock: number;
  daoForkBlock: null;
  daoForkSupport: boolean;
  eip150Block: number;
  eip150Hash: string;
  eip155Block: number;
  eip158Block: number;
  byzantiumBlock: number;
  constantinopleBlock: number;
  petersburgBlock: number;
  istanbulBlock: number;
  muirGlacierBlock: number;
  berlinBlock: number;
  londonBlock: number;
  clique: {
    period: number;
    epoch: number;
  };
  arbitrum: {
  EnableArbOS: boolean;
  AllowDebugPrecompiles: boolean;
  DataAvailabilityCommittee: boolean;
  InitialArbOSVersion: number;
  InitialChainOwner: Address;
  GenesisBlockNum: number;
  MaxCodeSize: number;
  MaxInitCodeSize: number;
  };
}
```

Out of `chainConfig`'s parameters, a few are particularly important and are likely to be configured by the chain owner: `chainId`, `DataAvailabilityCommittee`, `InitialChainOwner`, `MaxCodeSize`, and `MaxInitCodeSize`. `chainConfig`'s other parameters use default values and are less frequently modified. We will go through these parameters in the [Rollup Configuration Parameters](#rollup-configuration-parameters) section.

All the parameters explained in this section are customizable, allowing the chain deployer to stick with default settings or specify new values.

### Rollup configuration parameters

In this section, we'll provide detailed explanations of the various chain configuration parameters used in the deployment of Orbit chains.

| Parameter             | Description                                                                                                                                                                                                                                                                                                           |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `batchPoster`         | Sets the batch poster address of your Orbit chain. The batch poster account batches and compresses transactions on the Orbit chain and transmits them back to the parent chain.                                                                                                                                       |
| `validators`          | Array of <a data-quicklook-from="validator">validator</a> addresses. Validators are responsible for validating the chain state and posting Rollup Blocks (`RBlocks`) back to the parent chain. They also monitor the chain and initiate challenges against potentially faulty RBlocks submitted by other validators.  |
| `nativeToken`         | Determines the token used for paying gas fees on the Orbit chain. It can be set to `ETH` for regular chains or to any `ERC-20` token for **gas fee token network** Orbit chains.                                                                                                                                      |
| `confirmPeriodBlocks` | Sets the challenge period in terms of blocks, which is the time allowed for validators to dispute or challenge state assertions. On Arbitrum One and Arbitrum Nova, this is currently set to approximately seven days in block count. `confirmPeriodBlocks` is measured in L1 blocks, we recommend a value of `45818` |
| `baseStake`           | Orbit chain validator nodes must stake a certain amount to incentivize honest participation. The `basestake` parameter specifies this amount.                                                                                                                                                                         |
| `stakeToken`          | Token in which the `basestake` is required. It represents the token's address on the parent chain. Can be `ETH` or a `ERC-20`token. Note that the use of an `ERC-20` token as the `stakeToken` is currently not supported by Nitro, but will be soon.                                                                 |
| `owner`               | Account address responsible for deploying, owning, and managing your Orbit chain's base contracts on its parent chain.                                                                                                                                                                                                |
| `chainId`             | Sets the unique chain ID of your Orbit chain.                                                                                                                                                                                                                                                                         |

:::note

`chainId` and owner parameters must be equal to the chain ID and `InitialOwner` defined in the `chainConfig` section.

:::

While other configurable parameters exist, they are set to defaults, and it's generally not anticipated that a chain deployer would need to modify them. However, if you believe there's a need to alter any other parameters not listed here, please feel free to [contact us on our Discord server](https://discord.com/channels/585084330037084172/1116812793606328340/1205801459518804018) for further details and support.
