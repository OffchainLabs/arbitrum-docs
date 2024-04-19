n and deployment helpers

The Orbit SDK provides three APIs, `prepareChainConfig`, `createRollupPrepareConfig`, and `createRollupPrepareTransactionRequest` to facilitate the configuration and deployment of Rollup parameters for an Orbit chain. These APIs simplify the process of setting up and deploying the core contracts necessary for an Orbit chain.

| API                                     | Benefit                                                                  | Description                                                                                                                  |
| :-------------------------------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `prepareChainConfig`                    | Simplifies the creation of the `chainConfig` parameter object            | Takes `config` parameters as arguments and returns a `chainConfig` `JSON` string.                                            |
| `createRollupPrepareConfig`             | Simplifies the creation of the `Config` parameter object                 | Takes a `Config` struct as argument and fills in undefined params with default values.                                       |
| `createRollupPrepareTransactionRequest` | Simplifies the creation of the `RollupDeploymentParams` parameter object | Takes `RollupDeploymentParams` as argument, applies defaults where necessary, and return a complete `RollupDeploymentParams` |
| `createTokenBridgeEnoughCustomFeeTokenAllowance` | Verifies that the deployer's address has enough allowance to pay for the fees associated with the token bridge deployment |  |
| `createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest` | Generates the raw transaction required to approve the native token for the `TokenBridgeCreator` contract. |  |
| `createTokenBridgePrepareTransactionRequest` | Generates token bridge deployment transaction request.|  |
| `waitForRetryables` | Sends token bridge deployment transaction.|  |

#### prepareChainConfig API:

For an easier config preparation, the Orbit SDK provides the `prepareChainConfig` API, which takes config parameters as arguments and returns a `chainConfig` `JSON` string. Any parameters not provided will default to standard values, which are detailed in the [Orbit SDK repository](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1f251f76a55bc1081f50938b0aa9f7965660ebf7/src/prepareChainConfig.ts#L3-L31).

Here are the parameters you can use with `prepareChainConfig`:

| Parameter                   | Description                                                                                                                                     |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `chainId`                   | Your Orbit chain's unique identifier. It differentiates your chain from others in the ecosystem.                                                |
| `DataAvailabilityCommittee` | Set to `false`, this boolean makes your chain as a Rollup, set to `true` configures it as an AnyTrust chain.                                    |
| `InitialChainOwner`         | Identifies who owns and controls the chain.                                                                                                     |
| `MaxCodeSize  `             | Sets the maximum size for contract bytecodes on the Orbit chain. e.g. Ethereum mainnet has a limit of 24,576 Bytes.                             |
| `MaxInitCodeSize`           | Similar to `MaxCodeSize`, defines the maximum size for your Orbit chain's **initialization** code. e.g. Ethereum mainnet limit is 49,152 Bytes. |

Below is an example of how to use `prepareChainConfig` to set up a Rollup chain with a specific `chainId`, an `InitialChainOwner` (named as `deployer_address`):

```js
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
  chainId: Some_Chain_ID,
  arbitrum: { InitialChainOwner: deployer_address, DataAvailabilityCommittee: false },
});
```

#### createRollupPrepareConfig API:

This API is designed to take parameters defined in the Config struct and fill in the rest with default values. It outputs a complete Config struct that is ready for use.

For example, to create a Config struct with a specific chain ID (`chainId`), an owner address (`deployer_address`), and a `chainConfig` as described in the [previous section](#chain-config-parameter), you would use the Orbit SDK as follows:

```js
import { createRollupPrepareConfig } from '@arbitrum/orbit-sdk';

const config = createRollupPrepareConfig({
  chainId: BigInt(chainId),
  owner: deployer.address,
  chainConfig,
});
```

#### createRollupPrepareTransactionRequest API:

This API accepts parameters defined in the `RollupDeploymentParams` struct, applying defaults where necessary, and generates the `RollupDeploymentParams`. This struct is then used to create a raw transaction which calls the `createRollup` function of the `RollupCreator` contract. As discussed in previous sections, this function deploys and initializes all core Orbit contracts.

For instance, to deploy using the Orbit SDK with a Config equal to `config`, a `batchPoster`, and a set of validators such as `[validator]`, the process would look like this:

```js
import { createRollupPrepareTransactionRequest } from '@arbitrum/orbit-sdk';

const request = await createRollupPrepareTransactionRequest({
  params: {
    config,
    batchPoster,
    validators: [validator],
  },
  account: deployer_address,
  publicClient,
});
```

After creating the raw transaction, you need to sign and broadcast it to the network.
