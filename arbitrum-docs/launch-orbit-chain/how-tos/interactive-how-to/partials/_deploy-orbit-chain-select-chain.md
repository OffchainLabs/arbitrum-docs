import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

Select the chain you are interested in deploying:

import MultidimensionalContentControlsPartial from './_multidimensional-content-controls-deploy-orbit-chain-partial.md';

<MultidimensionalContentControlsPartial />
