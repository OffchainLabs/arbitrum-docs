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
