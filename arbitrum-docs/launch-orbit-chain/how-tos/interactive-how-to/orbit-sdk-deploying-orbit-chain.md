---
title: 'How to Deploy an Orbit chain using the Orbit SDK'
sidebar_label: 'Deploy an Orbit chain using the Orbit SDK'
description: 'How to Deploy an Orbit chain using the Orbit SDK'
author: anegg0
sme: anegg0
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
user_story: As a current or prospective Orbit chain deployer, I need to configure and deploy an Orbit chain using the Orbit SDK.
content_type: how-to
---

This document explains how to use the Orbit SDK to deploy a <a data-quicklook-from="arbitrum-orbit">`Orbit chain`</a>.

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the `Request an update` button at the top of this document.

:::

:::info

See the ["create-rollup-eth" example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts) in the Orbit SDK repository for additional guidance.

:::

<div className='quickstart'>

import ChainSelectorPartial from './partials/_select-orbit-chain-partial.md';

<ChainSelectorPartial />


### Getting the Orbit chain information after deployment

Once you've successfully deployed your Orbit chain, the next step is to retrieve detailed information about the deployment, which you can do with the `createRollupPrepareTransactionReceipt` API.

After sending the signed transaction and receiving the transaction receipt, you can use the `createRollupPrepareTransactionReceipt` API to parse this receipt and extract the relevant data. This process will provide comprehensive details about the deployed chain, such as contract addresses, configuration settings, and other information.

Here's an example of how to use the Orbit SDK to get data from a deployed Orbit chain:

```js
import { createRollupPrepareTransactionReceipt } from '@arbitrum/orbit-sdk';

const data = createRollupPrepareTransactionReceipt(txReceipt);
```

In this example, `txReceipt` refers to the transaction receipt you received after deploying the chain. By passing this receipt to the `createRollupPrepareTransactionReceipt` function, you can access your Orbit chain's information. This feature of the Orbit SDK simplifies the post-deployment process, allowing you to quickly and efficiently gather all necessary details about your chain for further use or reference.

</div>
