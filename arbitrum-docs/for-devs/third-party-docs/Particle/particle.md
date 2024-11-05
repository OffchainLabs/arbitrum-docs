---
title: "How to implement Particle Connect for AA-enabled social logins"
description: "Guide covering the process of leveraging Particle Network's flagship SDK to onboard a user into a smart account through social logins."
author: Ethan Francis
sme: TABASCOatw
sidebar_label: 'Particle Network' 
---

:::info Community member contribution

Shoutout to [@TABASCOatw](https://github.com/TABASCOatw) for contributing the following [third-party document](/for-devs/third-party-docs/contribute)!

:::

[Particle Network](https://particle.network) provides Wallet Abstraction services through its Account Abstraction stack, which is designed to simplify and speed up user onboarding with a suite of SDKs. 

By integrating customizable Externally Owned Account (EOA) and Account Abstraction (AA) modules, Particle enables fast 2-click onboarding via social login options like Google, email, and phone, along with traditional Web3 options. 

This approach lets developers embed application-specific wallets, bypassing the need for conventional wallet management and provides users with a seamless and tailored Web3 interaction experience.

Arbitrum was one of the first blockchains supported by Particle Network. Because of this, Particle Network has extensive support for:

- Arbitrum One, through:
  - EOA (non-AA social login)
  - SimpleAccount
  - Biconomy (V1 and V2)
  - Light Account
  - Cyber Account
- Arbitrum Nova, through:
  - EOA (non-AA social login)
  - SimpleAccount
  - Biconomy (V1 and V2)

Alongside a similar degree of support for Arbitrum Sepolia.

Given its modular architecture, developers have the liberty to choose which of the above smart account implementations they onboard a user into after the social login process.

The user flow with Particle Network begins with social logins (using either a custom authentication or preset login methods provided by Particle Network), which leads to the generation of an EOA through MPC-TSS. This EOA is then used as a Signer for a smart account implementation that best fits the needs of the application in question (natively, this means a choice between SimpleAccount, Biconomy V1/V2, Light Account, and Cyber Account). A visualization of this process can be found below:

![](https://i.imgur.com/qfEpjgz.png)

---

This document outlines the high-level steps for building a demo application on Arbitrum Sepolia using the [Particle Connect SDK](https://developers.particle.network/api-reference/connect/desktop/web) — Particle's flagship onboarding SDK. The Particle Connect SDK enables quick 2-click onboarding with social and Web3 login options in a single modal. In this demo, we'll onboard users through a SimpleAccount instance of a smart account via social login and execute a gasless (sponsored) transaction.

## Getting started

This tutorial uses a [Next.js app](https://nextjs.org/docs/getting-started/installation) with TypeScript and Tailwind CSS to showcase wallet creation on Arbitrum through social logins.

With the Particle Connect SDK, wallet creation, user login, and blockchain interactions are simplified into a cohesive interface. Supporting both social logins and traditional Web3 wallets.

### Dependencies

You'll need only a few dependencies to integrate Particle Connect into your Arbitrum application. Particle Connect offers built-in Account Abstraction (AA) support; however, in this example, we'll install the Particle AA SDK to use an EIP-1193 providers, such as ethers.

```bash
yarn add @particle-network/connectkit viem@^2 @particle-network/aa ethers
```

### Setting up the Particle dashboard

Before jumping into the configuration process, you'll need to go to the [Particle dashboard](https://dashboard.particle.network) to retrieve three values required for your project.

When using any SDK offered by Particle Network, you'll routinely need a `projectId`, `clientKey`, and `appId`. These exist to authenticate your project and create a connection between your instance of Particle Auth and the Particle dashboard (which allows you to customize the application-embedded modals, track users, fund your Paymaster, and so on).

Once you've navigated to the Particle dashboard, follow the process below:

1. Create a new project through **Add New Project**.
2. Click **Web** under **Your Apps** (if you intend to use an alternative platform, take a look at the [platform-specific guides on Particle's documentation](https://developers.particle.network/reference/introduction-to-api-sdk-reference))
3. Choose a name and domain for your application (if you have yet to deploy or decide on a domain where you intend to deploy, feel free to use any filler one).
4. Copy the **Project ID**, **Client Key** and **App ID**.

Given the nature of these values, it's recommended that you store them within a `.env` file with this format:

```shell
NEXT_PUBLIC_PROJECT_ID='PROJECT_ID'
NEXT_PUBLIC_CLIENT_KEY='CLIENT_KEY'
NEXT_PUBLIC_APP_ID='APP_ID'
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID='WALLETCONNECT_PROJECT_ID'
```

## Configuring Particle Connect

To get started, we'll configure and initialize Particle Connect. Create a new `ConnectKit.tsx` file in your `src` directory. Here, we'll set up the `ParticleConnectKit` component, a wrapper for the configured `ConnectKitProvider` instance, which will serve as the central interface for configuration.

```typescript
"use client";

import React from "react";
import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import { evmWalletConnectors } from "@particle-network/connectkit/evm";
import { arbitrumSepolia } from "@particle-network/connectkit/chains";
import { wallet, EntryPosition } from "@particle-network/connectkit/wallet";
import { aa } from "@particle-network/connectkit/aa";

const config = createConfig({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
  appId: process.env.NEXT_PUBLIC_APP_ID!,

  walletConnectors: [
    authWalletConnectors({}), // Social logins

    // Default Web3 logins
    evmWalletConnectors({
      walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID, // optional, retrieved from https://cloud.walletconnect.com
    }),
  ],

  plugins: [
    wallet({
      entryPosition: EntryPosition.BR, // Positions the modal button at the bottom right on login
      visible: true, // Determines if the wallet modal is displayed
    }),
    aa({
      name: "SIMPLE",
      version: "2.0.0",
    }),
  ],
  chains: [arbitrumSepolia],
});

export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
```

This code sets up Particle Connect with a configuration for wallet authentication and blockchain interactions on Arbitrum Sepolia. It includes social logins and traditional Web3 options through WalletConnect and enables Account Abstraction (AA) with a `simpleAccount` instance version 2.0.0. The configured `ConnectKitProvider` component then wraps the app’s content, making this configuration available.

## Integrate Particle Connect in Your App

Once configured, wrap your application with the `ParticleConnectKit` component to make the Particle Connect SDK accessible throughout the app. Update the `layout.tsx` file in the `src` directory as shown below:

```tsx
import { ParticleConnectkit } from "@/components/Connectkit";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Particle Connectkit App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParticleConnectkit>{children}</ParticleConnectkit>
      </body>
    </html>
  );
}
```

## Building the Application

With your project set up, dependencies installed, and Particle Connect configured, you can start building in the `page.tsx` file.

In `page.tsx`, you’ll define the core features: login flow, data visualization, transaction handling, and the UI.

### Connecting the Wallet

With `layout.tsx` configured, the next step is to add a primary **Connect Wallet** button to facilitate user login. Import `ConnectButton` from `@particle-network/connectkit` and add it to the interface. After the user logs in, the `ConnectButton` turns into an embedded wallet widget.

```tsx
"use client";
import { ConnectButton, useAccount } from "@particle-network/connectkit";

const HomePage = () => {
  const { address, isConnected, chainId } = useAccount();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <ConnectButton />
        {isConnected && (
          <>
            <h2>Address: {address}</h2>
            <h2>Chain ID: {chainId}</h2>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
```
### Sending Transactions with an EIP-1193 Provider

Particle Connect includes AA features out of the box, but using it with the Particle AA SDK allows you to work with EIP-1193 providers, like `ethers`. This approach is especially helpful if you're already familiar with these providers or are integrating Particle Connect into an existing app.

To implement this, wrap the smart account provided by Particle Connect in an instance of `ethers` to create a `customProvider`. With this setup, you can use `ethers` as usual, with the smart account handling the signing of transactions in the background.

```tsx
import {useSmartAccount } from "@particle-network/connectkit";
import { AAWrapProvider, SendTransactionMode } from "@particle-network/aa";

const smartAccount = useSmartAccount();

// Init custom provider with gasless transaction mode
const customProvider = smartAccount
? new ethers.BrowserProvider(
    new AAWrapProvider(
        smartAccount,
        SendTransactionMode.Gasless
    ) as Eip1193Provider,
    "any"
    )
: null;

/**
 * Sends a transaction using the ethers.js library.
 * This transaction is gasless since the customProvider is initialized as gasless
*/
const executeTxEthers = async () => {
    if (!customProvider) return;
  
    const signer = await customProvider.getSigner();
    const tx = {
      to: recipientAddress,
      value: parseEther("0.01").toString(),
    };
  
    const txResponse = await signer.sendTransaction(tx);
    const txReceipt = await txResponse.wait();
    console.log(txReceipt?.hash)
  };
```


This transaction will be gasless because it meets two key conditions:

1. **Gasless Mode Configuration**: By setting `SendTransactionMode.Gasless` within `AAWrapProvider`, we've specified that the transaction should be gasless and sponsored.
   
2. **Funding Requirements**: On a Testnet like Arbitrum Sepolia, all transactions are automatically sponsored, meaning you don't need to deposit USDT to cover transaction fees. However, on mainnets like Arbitrum One or Arbitrum Nova, the Paymaster (configurable in the [Particle dashboard](https://dashboard.particle.network)) would need sufficient funds to sponsor these transactions. 

This example demonstrates how to use an existing EIP-1193 provider, but you can also construct a `userOp` directly with Particle Connect. For an example, refer to the [starter repository](https://github.com/Particle-Network/connectkit-aa-usage/blob/2017262daf297624362d51f3d50cccd3b4606ef9/app/page.tsx#L117).

## Full app example
With the setup complete, Particle Connect can now be leveraged, as demonstrated in the example application below.

In this example, the application creates a smart account on Arbitrum Sepolia using a social login or a Web3 login and sends a gasless transaction of 0.01 ETH via the `ethers` provider.

```tsx
"use client";
import React, { useEffect, useState } from "react";

// Particle imports
import {
  ConnectButton,
  useAccount,
  usePublicClient,
  useSmartAccount,
} from "@particle-network/connectkit";

// Eip1193 and AA Provider
import { AAWrapProvider, SendTransactionMode } from "@particle-network/aa"; // Only needed with Eip1193 provider
import { ethers, type Eip1193Provider } from "ethers";
import { formatEther, parseEther } from "viem";

export default function Home() {
  const { isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const smartAccount = useSmartAccount();

  const [userAddress, setUserAddress] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Init custom provider with gasless transaction mode
  const customProvider = smartAccount
    ? new ethers.BrowserProvider(
        new AAWrapProvider(
          smartAccount,
          SendTransactionMode.Gasless
        ) as Eip1193Provider,
        "any"
      )
    : null;

  /**
   * Fetches the balance of a given address.
   * @param {string} address - The address to fetch the balance for.
   */
  const fetchBalance = async (address: string) => {
    try {
      const balanceResponse = await publicClient?.getBalance({
        address: address as `0x${string}`,
      });
      if (balanceResponse) {
        const balanceInEther = formatEther(balanceResponse).toString();
        setBalance(balanceInEther);
      } else {
        setBalance("0.0");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0.0");
    }
  };

  /**
   * Loads the user's account data, including address and balance.
   */
  useEffect(() => {
    const loadAccountData = async () => {
      if (isConnected && smartAccount) {
        try {
          const address = await smartAccount.getAddress();
          setUserAddress(address);
          await fetchBalance(address);
        } catch (error) {
          console.error("Error loading account data:", error);
        }
      }
    };
    loadAccountData();
  }, [isConnected, smartAccount]);

  /**
   * Sends a transaction using the ethers.js library.
   * This transaction is gasless since the customProvider is initialized as gasless
   */
  const executeTxEthers = async () => {
    if (!customProvider) return;

    const signer = await customProvider.getSigner();
    try {
      const tx = {
        to: recipientAddress,
        value: parseEther("0.01").toString(),
      };

      const txResponse = await signer.sendTransaction(tx);
      const txReceipt = await txResponse.wait();

      setTransactionHash(txReceipt?.hash || null);
    } catch (error) {
      console.error("Failed to send transaction using ethers.js:", error);
    }
  };

  return (
    <div className="container min-h-screen flex flex-col justify-center items-center mx-auto gap-4 px-4 md:px-8">
      <div className="w-full flex justify-center mt-4">
        <ConnectButton label="Click to login" />
      </div>
      {isConnected && (
        <>
          <div className="border border-purple-500 p-6 rounded-lg w-full">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Address: <code>{userAddress || "Loading..."}</code>
            </h2>
            <h2 className="text-lg font-semibold mb-2 text-white">
              Balance: {balance || "Loading..."} {chain?.nativeCurrency.symbol}
            </h2>
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="mt-4 p-3 w-full rounded border border-gray-700 bg-gray-900 text-white focus:outline-none"
            />
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={executeTxEthers}
              disabled={!recipientAddress}
            >
              Send 0.001 {chain?.nativeCurrency.name}
            </button>
            {transactionHash && (
              <p className="text-green-500 mt-4">
                Transaction Hash: {transactionHash}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

### Available Particle Connect Hooks

This example illustrates a basic use of Particle Connect. For a complete list of available hooks, refer to the [Particle Connect documentation](https://developers.particle.network/api-reference/connect/desktop/web#key-react-hooks-for-particle-connect).

## Conclusion

Building an application on Arbitrum that takes advantage of social logins and smart accounts simultaneously only takes a few lines of code, and is even more succinct if you're already using Ethers, Web3.js, or any other standard library that supports EIP-1193 providers.

To view the complete demo application leveraging the code snippets covered throughout this document, take a look at the [GitHub repository](https://github.com/Particle-Network/connect-arbitrum-tutorial).

Additionally, to learn more about Particle Network, explore the following resources:

- Website: https://particle.network
- Blog: https://blog.particle.network
- Documentation: https://developers.particle.network
