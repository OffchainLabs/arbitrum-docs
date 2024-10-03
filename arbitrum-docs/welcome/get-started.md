---
title: 'Get started with Arbitrum'
description: An abbreviated introduction to the Arbitrum suite
author: symbolpunk
user_story: As a curious reader, I'd like to be quickly guided towards first steps based on my particular needs.
content_type: quickstart
---

<a data-quicklook-from="arbitrum">Arbitrum</a> is a suite of Ethereum scaling solutions that make it
easy to build and use decentralized applications. This document provides a high-level overview of the
Arbitrum suite along with onboarding guidance tailored to specific audiences.

## The Arbitrum suite

The Arbitrum suite includes the protocols, chains, services, and SDKs that power the Arbitrum ecosystem:

| Component                                                         | Description                                                                                         |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Arbitrum Rollup](/how-arbitrum-works/inside-arbitrum-nitro.md)   | A **protocol** for scaling Ethereum smart contracts.                                                |
| [Arbitrum AnyTrust](/how-arbitrum-works/inside-anytrust.md)       | A **protocol** for scaling Ethereum smart contracts even further, with a mild trust assumption.     |
| [Arbitrum Nitro](/how-arbitrum-works/inside-arbitrum-nitro.md)    | The node **software** that codifies the Rollup and AnyTrust protocols.                              |
| [Arbitrum nodes](/run-arbitrum-node/03-run-full-node.md)          | **Machines** that run Nitro in order to service and/or interact with an Arbitrum chain.             |
| [Arbitrum One](https://portal.arbitrum.io/?chains=arbitrum-one)   | A public Rollup **chain**.                                                                          |
| [Arbitrum Nova](https://portal.arbitrum.io/?chains=arbitrum-nova) | A public AnyTrust **chain**.                                                                        |
| [Arbitrum bridge](https://bridge.arbitrum.io/)                    | Lets you move ETH and ERC-20 tokens between Ethereum, Arbitrum, and select Orbit chains.            |
| [Arbitrum Orbit](https://orbit.arbitrum.io/)                      | Lets you run your own Rollup and AnyTrust chains.                                                   |
| [Arbitrum Stylus](/stylus/stylus-gentle-introduction)             | Lets you write EVM-compatible smart contracts in Rust and any other language that compiles to Wasm. |

## Arbitrum for users

**Users** interact with Arbitrum either through the Arbitrum bridge or by using dApps that have been deployed to an Arbitrum chain.

| Resource                                                 | Description                                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Arbitrum bridge](https://bridge.arbitrum.io/)           | Lets you move ETH and ERC-20 tokens between Ethereum, Arbitrum, and select Orbit chains. |
| [Arbitrum Portal](https://portal.arbitrum.io/)           | A directory of dApps on Arbitrum.                                                        |
| [Quickstart (bridge)](/arbitrum-bridge/01-quickstart.md) | Provides step-by-step instructions for first-time bridge users.                          |

## Arbitrum for developers

**Developers** build Arbitrum dApps by deploying smart contracts to an Arbitrum chain.

| Resource                                                                             | Description                                                                                              |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| [A gentle introduction to Arbitrum](/welcome/arbitrum-gentle-introduction)           | A technical introduction to Arbitrum's suite of scaling solutions.                                       |
| [Quickstart (Solidity)](/build-decentralized-apps/01-quickstart-solidity-hardhat.md) | Targeted at web2 developers who want to deploy their first Solidity smart contract to Arbitrum.          |
| [Quickstart (Rust)](/stylus/stylus-quickstart)                                       | Targeted at web3 developers who want to deploy their first Rust smart contract to Arbitrum using Stylus. |

## Arbitrum for node runners

**Node runners** run the machines that support the Arbitrum ecosystem.

| Resource                                                                                                     | Description                                                                                                           |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [Run a full node](/run-arbitrum-node/03-run-full-node.md)                                                    | Targeted at node runners who want to access Arbitrum chains without having to connect to a third-party node.          |
| [Configure a Data Availability Committee](/run-arbitrum-node/data-availability-committees/01-get-started.md) | Targeted at Data Availability Committee members and Orbit chain operators who want to run a Data Availability Server. |

## Arbitrum for chain operators

**Chain operators** use Arbitrum Orbit to run special-purpose Rollup and AnyTrust chains.

| Resource                                                                   | Description                                                                                     |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [Orbit gentle introduction](/launch-orbit-chain/orbit-gentle-introduction) | Targeted at readers who want to understand Orbit's value proposition and use cases.             |
| [Orbit quickstart](/launch-orbit-chain/orbit-quickstart)                   | Targeted at chain operators who want to deploy their first Arbitrum chain using Arbitrum Orbit. |

## How it works

| Resource                                                                                           | Description                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [Inside Nitro](/how-arbitrum-works/inside-arbitrum-nitro.md)                                       | A technical deep dive into Nitro's architecture.  |
| [Inside AnyTrust](/how-arbitrum-works/inside-anytrust.md)                                          | A technical deep dive into the AnyTrust protocol. |
| [Arbitrum whitepaper](https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf) | The original whitepaper that introduced Nitro.    |
| [DAO docs](https://docs.arbitrum.foundation/gentle-intro-dao-governance)                           | Docs that support members of the Arbitrum DAO.    |
