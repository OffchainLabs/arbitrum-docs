import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import PublicPreviewBannerPartial from '../../../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

The Arbitrum Orbit SDK lets you programmatically create and manage your own Orbit chain(s). Its capabilities include:

- Configuration and deployment of your Orbit chain's core contracts
- Initialization of your chain and management of its configuration post-deployment


## 1. Select a chain type

There are three types of Orbit chains. Review the following table to determine which type best fits your needs:

| Chain Type           | Description                                                                                                                                                                                                                                                                                                                               | Use Case                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Rollup**           | Offers Ethereum-grade security by batching, compressing, and posting data to the parent chain, similarly to [Arbitrum One](https://arbitrum.io/).                                                                                                                                                                                         | Ideal for applications that require high security guarantees.                         |
| **AnyTrust**         | Implements the [AnyTrust protocol](/inside-arbitrum-nitro/#inside-anytrust), relying on an external [Data Availability Committee (DAC)](/intro/glossary#data-availability-committee-dac) to store data and provide it on-demand instead of using their [parent chain](/intro/glossary/#parent-chain) as the Data Availability (DA) layer. | Suitable for applications that require lower transaction fees.                        |
| **Custom gas token** | An AnyTrust Orbit chain with the ability to specify a custom `ERC-20` gas token.                                                                                                                                                                                                                                                          | Ideal for applications that require custom gas fee tokens and lower transaction fees. |


import MultidimensionalContentControlsPartial from '../../../../partials/_multidimensional-content-controls-partial.md';

<MultidimensionalContentControlsPartial />


## Introduction

Prysm is an implementation of the [Ethereum proof-of-stake consensus specification](https://github.com/ethereum/consensus-specs). In this quickstart, you’ll use Prysm to run an Ethereum node and optionally a validator client. This will let you stake 32 ETH using hardware that you manage.

This is a beginner-friendly guide. Familiarity with the command line is expected, but otherwise this guide makes no assumptions about your technical skills or prior knowledge.

At a high level, we'll walk through the following flow:

 1. Configure an **execution node** using an execution-layer client.
 2. Configure a **beacon node** using Prysm, a consensus-layer client.
 3. Configure a **validator client** and stake ETH using Prysm (optional).

<br />

:::info Knowledge Check

**Not familiar with nodes, networks, and related terminology?** Consider reading Nodes and networks before proceeding. 

:::

