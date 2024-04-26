## Deploy your Orbit chain

Orbit SDK provides the `createRollupPrepareTransactionRequest` helper to prepare your transaction:

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

After creating the raw transaction, you need to sign and broadcast it to the network, as shown in the [`create-rollup-eth` example.](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/low_level.ts#L71)
