---
title: "How to add your Orbit chain to Arbitrum's bridge"
description: "Learn how to add your Orbit chain to Arbitrum's bridge."
author: ojurkowitz
sme: jose-franco
sidebar_position: 2
---

import ImageZoom from '@site/src/components/ImageZoom';

This how-to will walk you through the process of adding your Orbit chain to the [Arbitrum bridge](https://bridge.arbitrum.io/). There's one section for mainnet Orbit chains, and another for local testnet Orbit chains. You can access either section using the links on the right column.

## Request adding a mainnet Orbit chain to the Arbitrum bridge

Mainnet Orbit chains can be added to the Arbitrum Bridge by filling out [this form](https://github.com/OffchainLabs/arbitrum-token-bridge/issues/new/choose).

Once receiving your request, our team will review and apply internal criteria to include your chain in the bridge. Here are some of the criteria that a chain must follow to be added to the bridge:

- The use case must fall within existing legal and marketing guidelines
- The core rollup / token bridge contracts must not have been modified, except the cases where modifications have been done with a certified partnership and communicated to Offchain Labs
- The infrastructure and core contracts are hosted by one of our partnered RaaS teams

## Add a local testnet Orbit chain to the Arbitrum bridge

Currently, adding a testnet Orbit chain to the Arbitrum bridge must be done locally. This means that you will configure the UI to display the desired chain, but this change will only apply to you.

### Prerequisites

- A local testnet Orbit chain's configuration. Use an existing JSON configuration or follow the instructions on [Deploy and Orbit chain](https://docs.arbitrum.io/launch-orbit-chain/orbit-sdk-introduction) page for guidance on creating an L2 or L3 Orbit chain.
- A browser-based Ethereum wallet (i.e., [MetaMask](https://metamask.io/) or [OKX Wallet](https://www.okx.com/web3))

### Procedure

1. Navigate to https://bridge.arbitrum.io/.
2. Connect to the bridge UI using your wallet. The bridge UI will automatically switch to the correct testnet view.
3. Activate "Testnet mode", by clicking on your address in the top right corner -> Settings -> Turn on testnet mode.
4. In the same screen, scroll down to "Add Testnet Orbit Chain":
   <ImageZoom src="/img/orbit-bridge-testnet-mode.png" alt="Orbit bridge" className="img-600px" />
5. Copy and paste the JSON configuration (for Orbit chains deployed locally, use the configuration in your generated `outputInfo.json` file).
6. Click "Add Chain".

Congratulations! Your chain should now appear in both the network dropdown in the top navigation pane, and as an option in the bridging UI directly.
