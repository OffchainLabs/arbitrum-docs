:::info Token compatibility with available tooling

If you want your token to be compatible out of the box with all the tooling available (e.g., the [Arbitrum bridge](https://bridge.arbitrum.io/)), we recommend that you keep the implementation of the IArbToken interface as close as possible to the [L2GatewayToken](https://github.com/OffchainLabs/token-bridge-contracts/blob/main/contracts/tokenbridge/libraries/L2GatewayToken.sol) implementation example.

For example, if an allowance check is added to the `bridgeBurn()` function, the token will not be easily withdrawable through the Arbitrum bridge UI, as the UI does not prompt an approval transaction of tokens by default (it expects the tokens to follow the recommended L2GatewayToken implementation).

:::
