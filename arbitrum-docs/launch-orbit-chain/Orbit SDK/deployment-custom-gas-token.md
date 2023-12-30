---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Orbit SDK'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 3
---

### Custom gas token Orbit Deployment
Deploying a Custom Gas Token Orbit chain introduces a unique aspect to the standard Orbit chain setup – the ability to pay transaction fees using a specific ERC20 token instead of ETH. While the setup process largely mirrors that of a standard Rollup Orbit chain (as detailed on the page 1), there are key differences to account for when configuring a Custom Gas Token Orbit chain.

**Important Note** Custom gas token Orbit chains can be just Anytrust chains and you cannot have a Rollup Orbit with custom gas fee token.

#### Key Differences for Custom Gas Token Orbit Chain:

1. **Fee Token Specification:** The most significant difference is the specification of the ERC20 token that is on parent chain to be used as the gas fee token. This requires selecting an existing ERC20 token or deploying a new one to be used specifically for transaction fees on your Orbit chain. 
**Note** that currently just ERC20 tokens with 18 decimals is acceptable as gas token on Orbit chains.

2. **Chain Configuration**: When preparing the `chainConfig` using the Orbit SDK, you need to specify the chosen ERC20 token address as the `nativeToken`. This step is crucial for the system to recognize and use your selected ERC20 token for transaction fees.
**Note** that as discussed above the chain config need to be set to Anytrust chain type and `DataAvailabilityCommittee` should be **true**.

   Example:
   ```bash
   import { prepareChainConfig } from '@arbitrum/orbit-sdk';

   const chainConfig = prepareChainConfig({
       chainId: Some_Chain_ID,
       nativeToken: yourERC20TokenAddress,
       DataAvailabilityCommittee: true,
   });
   ```

3. **Token Approval before deployment process**: In custom gas token Orbit chains, the owner needs to give allowance to the rollupCreator contract before starting the deployment process, so that RollupCreator can spend enough tokens for the deployment process. For this purpose we defined two APIs on the Orbit SDK:
   1. **createRollupEnoughCustomFeeTokenAllowance**: This API would get related inputs and checks if the rollupCreator contract has enough Allowance on the token from the owner.
   
        ```bash
       import {createRollupEnoughCustomFeeTokenAllowance} from '@arbitrum/orbit-sdk';
       
       const allowanceParams = {
       nativeToken,
       account: deployer_address,
       publicClient: parentChainPublicClient,
       };
       
       const enough Allowance = createRollupEnoughCustomFeeTokenAllowance(allowanceParams)
        ```
   2. **createRollupPrepareCustomFeeTokenApprovalTransactionRequest**: This API get related inputs and create the transaction request to get the enough Allowance from the owner to the RollupCreator to spend nativeToken on the deployment process. An example would be:
   
       ```bash
       import {createRollupEnoughCustomFeeTokenAllowance} from '@arbitrum/orbit-sdk';
       
       const allowanceParams = {
       nativeToken,
       account: deployer_address,
       publicClient: parentChainPublicClient,
       };
       
       const approvalTxRequest = await createRollupPrepareCustomFeeTokenApprovalTransactionRequest(
         allowanceParams,
       );
        ```

#### Deployment Process:

The overall deployment process, including the use of APIs like `createRollupPrepareConfig` and `createRollupPrepareTransactionRequest`, remains similar. However, attention must be given to incorporating the ERC20 token details into these configurations.

**Note** that using API, you need to specify nativeToken as params as well. An example is:
```bash
  const txRequest = await createRollupPrepareTransactionRequest({
    params: {
      config,
      batchPoster,
      validators: [validator],
      nativeToken},
    account: deployer.address,
    publicClient: parentChainPublicClient,
  });
```

All other parts would be the same as what we've discussed on the Rollup Orbit chain deployment page.