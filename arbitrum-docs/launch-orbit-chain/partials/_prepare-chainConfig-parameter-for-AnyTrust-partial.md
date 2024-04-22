## Prepare `ChainConfig` object parameter

For an easier config preparation, the Orbit SDK provides the `prepareChainConfig` API, which takes config parameters as arguments and returns a `chainConfig` `JSON` string. Any parameters not provided will default to standard values, which are detailed in the [Orbit SDK repository](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1f251f76a55bc1081f50938b0aa9f7965660ebf7/src/prepareChainConfig.ts#L3-L31).


The `chainConfig` parameter within the `Config` structure is an essential element for tailoring your Orbit chain according to specific needs. This parameter is particularly significant when setting up an AnyTrust Orbit chain, as it includes configurations that distinguish it from a Rollup chain. The key parameter that differentiates an AnyTrust chain in this context is the `DataAvailabilityCommittee`.



Here are the parameters you can use with `prepareChainConfig`:

| Parameter                   | Description                                                                                                                                     |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `chainId`                   | Your Orbit chain's unique identifier. It differentiates your chain from others in the ecosystem.                                                |
| `DataAvailabilityCommittee` | Set to `false`, this boolean makes your chain as a Rollup, set to `true` configures it as an AnyTrust chain.                                    |
| `InitialChainOwner`         | Identifies who owns and controls the chain.                                                                                                     |
| `MaxCodeSize  `             | Sets the maximum size for contract bytecodes on the Orbit chain. e.g. Ethereum mainnet has a limit of 24,576 Bytes.                             |
| `MaxInitCodeSize`           | Similar to `MaxCodeSize`, defines the maximum size for your Orbit chain's **initialization** code. e.g. Ethereum mainnet limit is 49,152 Bytes. |


For an AnyTrust chain, you need to set the `DataAvailabilityCommittee` to **true**. This setting is crucial as it indicates the chain's reliance on a committee for data availability, which is a hallmark of the AnyTrust model.

Here’s an example of how to configure the `chainConfig` for an AnyTrust chain using the Orbit SDK:

```js
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
  chainId: Some_Chain_ID,
  arbitrum: { InitialChainOwner: deployer_address, DataAvailabilityCommittee: true },
});
```

In this example, you set up the chain configuration with a specific `chainId`, the `InitialChainOwner` as the deployer's address, and importantly, you configure the `DataAvailabilityCommittee` as `true`. This configuration ensures that your Orbit chain is set up as an AnyTrust chain, utilizing the unique features and operational model of the AnyTrust system within the Arbitrum Orbit framework.
