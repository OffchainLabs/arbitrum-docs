---
title: "How to add your Orbit chain Arbitrum's bridge'"
sidebar_label: "Add your chain to Arbitrum's bridge"
description: "Learn how to add your Orbit (testnet) chain to Arbitrum's bridge."
author: ojurkowitz
sidebar_position: 2
---

This how-to will walk you through the process of adding your Orbit (testnet) chain to [Arbitrum's bridge](https://bridge.arbitrum.io/).


## Prerequisites 

- A local Orbit devnet chain. See the [Orbit quickstart](/launch-orbit-chain/orbit-quickstart) for instructions.


## Procedure

1. Navigate to https://bridge.arbitrum.io/.
2. Connect to Arbitrum Goerli or Sepolia. The bridge UI will automatically switch to the correct testnet view.
3. If you're connected to mainnet, and don't switch networks manually in your wallet, then you can enable testnet mode in the bridge by clicking on your address in the top right corner -> Settings -> Turn on testnet mode.
4. Go to Settings and scroll down to "Add testnet Orbit chain":
    ![Orbit Bridge](../assets/Orbit_bridge.png)
5. Copy and paste the JSON configuration from your generated `outputInfo.json` file when prompted.
6. Click "Add chain".


Your chain will appear in both the network dropdown in the top navigation pane, and as an option in the bridging UI directly.
