---
title: 'How to deploy a custom gas token chain using the Orbit SDK'
sidebar_label: 'Deploy a custom gas token chain'
description: 'How to deploy a custom gas token chain using the Orbit SDK'
author: GreatSoshiant
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 3
user_story: As a current or prospective Orbit chain deployer, I need to understand how to deploy a custom gas token chain using the Orbit SDK.
content_type: how-to
---

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the `Request an update` button at the top of this document.

:::

:::info

See the ["create a rollup custom fee token" example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-custom-fee-token/index.ts) in the Orbit SDK repository for additional guidance.

:::

This guide will help you configure and deploy a custom gas token Orbit chain.

Custom gas token orbit chains let participants pay transaction fees in `ERC-20` token instead of `ETH`, which is ideal for use cases requiring this feature and low transaction fees. You can learn more on our page covering [custom gas token requirements and configuration](use-a-custom-gas-token.mdx).

Deploying a custom gas token Orbit chain is similar to deploying an AnyTrust Orbit chain but with additional steps. To take advantage of all the chains configurations supported by Orbit, we recommend reading our short guides about [Rollup](orbit-sdk-deploying-rollup-chain.md) and [AnyTrust](orbit-sdk-deploying-anytrust-chain.md) configuration.

:::note

- Custom gas tokens are **not supported yet** on Rollup Orbit chains, only on Orbit AnyTrust chains.
- `ERC-20` tokens need 18 decimals to operate as gas tokens on Orbit chains.

:::

## 1. Custom gas token specification

The difference between custom gas token chains and other Orbit chains is the use of an `ERC-20` token as gas. Enabling this feature requires that you select an existing `ERC-20` token or deploy a new one on the parent chain.

## 2. Chain configuration

You can configure your Orbit chain using the [`prepareChainConfig`](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1f251f76a55bc1081f50938b0aa9f7965660ebf7/src/prepareChainConfig.ts#L3-L31) method and assigning it to a `chainConfig` variable.

Example:

```js
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
    chainId: Some_Chain_ID,
    nativeToken: yourERC-20TokenAddress,
    DataAvailabilityCommittee: true,
});
```

To use the `prepareChainConfig` method as shown in the example above, some inputs need to be defined:

| Parameter                   | Type      | Description                                                                                                                                                     |
| --------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chainId`                   | `number`  | Your Orbit chain's `chainId`.                                                                                                                                   |
| `nativeToken`               | `Address` | The contract address on the parent chain of the `ERC-20` token your chain will use for `gas` fees. It needs to have 18 decimals to be accepted on Orbit chains. |
| `DataAvailabilityCommittee` | `boolean` | Should be set to `true` since only AnyTrust chains can accept `ERC-20` tokens.                                                                                  |

## 3. Token approval before deployment process

In Custom gas token Orbit chains, the owner needs to give allowance to the `rollupCreator` contract before starting the deployment process so that `rollupCreator` can spend enough tokens for the deployment process. For this purpose, we defined two APIs on the Orbit SDK:

#### A. createRollupEnoughCustomFeeTokenAllowance

This API gets related inputs and checks if the `rollupCreator` contract has enough token `Allowance` from the owner:

```js
import {createRollupEnoughCustomFeeTokenAllowance} from '@arbitrum/orbit-sdk';

const allowanceParams = {
nativeToken,
account: deployer.address,
publicClient: parentChainPublicClient,
};

const enough Allowance = createRollupEnoughCustomFeeTokenAllowance(allowanceParams)
```

To build the `allowanceParams` object as shown in the example above, you need to provide with the following:

| Parameter      | Type           | Description                                                                                           |
| -------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `nativeToken`  | `Address`      | The contract address on the parent chain of the `ERC-20` token your chain will use for `gas` fees.    |
| `account`      | `Address`      | The address of the Orbit chain's deployer.                                                            |
| `publicClient` | `PublicClient` | The `PublicClient` object [as defined by the Viem library](https://viem.sh/docs/clients/public.html). |

#### B. createRollupPrepareCustomFeeTokenApprovalTransactionRequest

This API gets related inputs and creates the transaction request to secure enough allowance from the owner to the `RollupCreator` to spend `nativeToken` on the deployment process.

Example:

```js
import { createRollupEnoughCustomFeeTokenAllowance } from '@arbitrum/orbit-sdk';

const allowanceParams = {
  nativeToken,
  account: deployer.address,
  publicClient: parentChainPublicClient,
};

const approvalTxRequest =
  await createRollupPrepareCustomFeeTokenApprovalTransactionRequest(
    allowanceParams
  );
```

## 4. Deployment process

The overall deployment process, including the use of APIs like `createRollupPrepareDeploymentParamsConfig` and `createRollupPrepareTransactionRequest`, remains similar to the [AnyTrust deployment](orbit-sdk-deploying-anytrust-chain.md) process. However, attention must be given to incorporating the `ERC-20` token details into these configurations.

:::note

When using the API, you also need to specify `nativeToken` as a param.

:::

Example:

```js
const txRequest = await createRollupPrepareTransactionRequest({
  params: {
    config,
    batchPosters: [batchPoster],
    validators: [validator],
    nativeToken,
  },
  account: deployer.address,
  publicClient: parentChainPublicClient,
});
```

All other parts would be the same as explained in the [Rollup Orbit chain deployment page](orbit-sdk-deploying-rollup-chain.md).
