---
title: 'How to onboard users in your game and make a gasless transaction'
description: 'Learn how to use Openfort to integrate authentication, private key management, and account abstraction into your game on Arbitrum'
author: Joan Alavedra
sme: joalavedra
sidebar_label: 'Openfort'
---

:::info Community member contribution

The following document was contributed by  [@joalavedra](https://github.com/joalavedra). Give them a shoutout if you find it useful!

:::

**[<ins>Openfort</ins>](https://www.openfort.xyz/)** is a headless wallet solution that helps developers integrate authentication, private key management, and account abstraction into their dApps. By abstracting away the complexities of blockchain interactions, Openfort allows you to build Web3 applications with a Web2-like user experience, without requiring end users to manage private keys or hold cryptocurrency.

Openfort enables you to:
- Implement secure authentication and key management 
- Create and manage smart contract wallets
- Enable gasless and sponsored transactions

Check out **[<ins>Openfort's Documentation</ins>](https://www.openfort.xyz/docs)** to get started.

## Openfort Dashboard

The Openfort Dashboard allows you to:

- Create and manage projects
- Generate API keys
- Configure authentication providers
- Monitor transactions and analytics
- Set up webhooks for real-time notifications

:::info Openfort Dashboard

Please check out the [<ins>docs</ins>](https://www.openfort.xyz/docs/) to learn more about using the Openfort Dashboard. Click [<ins>here</ins>](https://dashboard.openfort.xyz) to access the Openfort Dashboard.

:::


## How to implement a gasless transaction on Arbitrum using Openfort

With Openfort, you can sponsor transactions for your users, meaning that in-game wallets don't need to have native tokens to execute transactions, such as minting an NFT. This guide will walk you through the process of implementing a gasless transaction to mint an NFT on Arbitrum.

### 1. Import the NFT Contract

First, you need to import the smart contract you'll be interacting with. In this case, we'll use an NFT contract with a 'mint' function.

```bash
curl https://api.openfort.xyz/v1/contracts \
  -u "$YOUR_SECRET_KEY:" \
  -d 'name=NFT Contract' \
  -d 'chainId=42161' \
  -d 'address=YOUR_CONTRACT_ADDRESS'
```

Replace `YOUR_CONTRACT_ADDRESS` with the address of your NFT contract on Arbitrum.

### 2. Set up the Gas Policy

Create a new policy to sponsor gas fees for users:

```bash
curl https://api.openfort.xyz/v1/policies \
  -H "Authorization: Bearer $YOUR_SECRET_KEY" \
  -d chainId=42161 \
  -d name="Arbitrum NFT Sponsor" \
  -d "strategy[sponsorSchema]=pay_for_user"
```

Then, add a policy rule for the NFT contract:

```bash
curl https://api.openfort.xyz/v1/policies/:id/policy_rules \
  -H "Authorization: Bearer $YOUR_SECRET_KEY" \
  -d type="contract_functions" \
  -d functionName="mint" \
  -d contract="con_..."
```

Replace `:id` with the policy ID returned from the previous step, and `con_...` with your contract ID.

### 3. Create a gasless transaction

Now, let's create a transaction to mint an NFT without the user paying for gas:

```javascript
const Openfort = require('@openfort/openfort-node').default;
const openfort = new Openfort(YOUR_SECRET_KEY);

const policyId = 'pol_...'; // Your policy ID from step 2

const transactionIntent = await openfort.transactionIntents.create({
  chainId: 42161, // Arbitrum One
  policy: policyId,
  optimistic: true,
  interactions: {
    contract: 'con_....', // Your NFT contract ID
    functionName: 'mint',
    functionArgs: ['0x...'] // Address to receive the NFT
  }
});
```

### 4. Optional: specify the player

If you want to associate the transaction with a specific player:

```javascript
const Openfort = require('@openfort/openfort-node').default;
const openfort = new Openfort(YOUR_SECRET_KEY);

const playerId = 'pla_...'; // Your player ID
const policyId = 'pol_...'; // Your policy ID from step 2

const transactionIntent = await openfort.transactionIntents.create({
  player: playerId,
  chainId: 42161, // Arbitrum One
  policy: policyId,
  optimistic: true,
  interactions: {
    contract: 'con_....', // Your NFT contract ID
    functionName: 'mint',
    functionArgs: [playerId] // Minting to the player's address
  }
});
```

By following these steps, you've created a gasless transaction on Arbitrum using Openfort. The user can now mint an NFT without needing to hold ETH for gas fees. Remember to handle the response from the `transactionIntents.create` call in your application to provide feedback to the user about the minting process.

:::info Detailed tutorial

For a more detailed tutorial, please refer to the [<ins>Openfort Quick Start Guide</ins>](https://www.openfort.xyz/docs/guides/getting-started).

:::

## Connect with Openfort

Need further assistance? Reach out to Openfort for support and stay updated:

- Visit Openfort's official website at [openfort.xyz](https://www.openfort.xyz)
- Read the [Documentation](https://www.openfort.xyz/docs)
- For support, contact the Openfort team via [Discord](https://discord.gg/t7x7hwkJF4)
- Follow Openfort on [Twitter](https://twitter.com/openfortxyz)
- Check out Openfort on [GitHub](https://github.com/openfort-xyz)