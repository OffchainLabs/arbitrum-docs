---
title: 'A gentle introduction: Orbit chains'
description: 'Launch your own Arbitrum Orbit chain using the Arbitrum Nitro codebase. Build an L2 or an L3 with the ability to customize every aspect of the chain specifically for your needs.'
author: symbolpunk
sme: oliviaJ3388
target_audience: technical decision-makers, people familiar with web3 who will decide to use Orbit on behalf of their organizations
sidebar_position: 1
---

This document is for developers and decision-makers who want to learn more about **Arbitrum Orbit**, a new product offering that lets you create your own Arbitrum <a data-quicklook-from="arbitrum-rollup-protocol">Rollup</a> and <a data-quicklook-from="arbitrum-anytrust-protocol">AnyTrust</a> chains.

If you'd prefer to learn by doing, see the [Orbit quickstart](./orbit-quickstart) for step-by-step instructions that walk you through the process of configuring and launching your own Orbit chain.

import PublicPreviewBannerPartial from './partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

### In a nutshell:

- Arbitrum Orbit is the **permissionless path** for launching customizable dedicated chains using Arbitrum technology.
- Orbit Chains can be a <a data-quicklook-from='layer-2-l2'>Layer 2 (L2)</a> chain which settles directly to Ethereum, or a Layer 3 (L3) chain which can settle to any Ethereum L2, such as <a data-quicklook-from='arbitrum-one'>Arbitrum One</a>.
- Configure numerous components of the chain such as throughput, privacy, gas token, governance, precompiles, data availability layers and more, **the possibilities are endless**.
- **You own your Orbit chain** and can decentralize its ownership, validation, and other dependencies.
- Leverage <a data-quicklook-from='arbitrum-nitro'>Arbitrum Nitro</a>, the tech stack powering interactive fraud proofs, advanced compression, [EVM+ compatibility via Stylus](https://docs.arbitrum.io/stylus/stylus-gentle-introduction), and continuous improvements.

### What's Orbit?

import {
  MermaidWithHtml,
  Nodes,
  Node,
  Connection,
  NodeDescriptions,
  NodeDescription,
} from '/src/components/MermaidWithHtml/MermaidWithHtml';

<MermaidWithHtml>
  <Nodes>
    <Node id="1">Orbit L2</Node>
    <Node id="2">Orbit L3</Node>
    <Node id="3">Arbitrum One (L2)</Node>
    <Node id="4">Orbit L2</Node>
    <Node id="5">Ethereum (L1)</Node>
    <Connection from="1" to="5" />
    <Connection from="2" to="3" />
    <Connection from="3" to="5" />
    <Connection from="4" to="5" />
  </Nodes>
  <NodeDescriptions>
    <NodeDescription for="1,2,4">
      <strong>Arbitrum Orbit</strong> is a new product offering that lets you create your own
      customizable L2 or L3 chain.
    </NodeDescription>
    <NodeDescription for="3">
      L3 Orbit chains can settle to other L2 chains, such as <strong>Arbitrum One</strong>, which
      settles to Ethereum.
    </NodeDescription>
    <NodeDescription for="5">
      <strong>Ethereum</strong> is a public Layer 1 (L1) chain.
    </NodeDescription>
  </NodeDescriptions>
</MermaidWithHtml>

- You can think of Orbit chains as **deployable, configurable instances of the Arbitrum Nitro tech stack**.
- You can also think of them as **tailored chains** - chains tailored precisely to **your exact use-case and business needs**.
- This gives you another way to **progressively decentralize** your applications and **incrementally adopt** the properties and security assumptions of Ethereum's base layer.
- Every Orbit chain can be configured to be either a <a data-quicklook-from='arbitrum-rollup-protocol'>Rollup</a> or <a data-quicklook-from='arbitrum-anytrust-protocol'>AnyTrust</a> Chain.
  - Note that <a data-quicklook-from="arbitrum-one">Arbitrum One</a> is an example of a rollup, and <a data-quicklook-from="arbitrum-nova">Arbitrum Nova</a> is an example of an AnyTrust chain.
- Arbitrum One and Arbitrum Nova are owned and governed by the [Arbitrum DAO](https://docs.arbitrum.foundation/concepts/arbitrum-dao). With Orbit chains, _you_ determine the way that your chain is governed.

### What problem does Orbit solve?

The Ethereum ecosystem is supported by a **decentralized network of nodes** that each run Ethereum's Layer 1 (L1) client software. Ethereum's block space is in high demand, so users are often stuck waiting for the network to become less congested (and thus, less expensive).

Arbitrum's <a data-quicklook-from="arbitrum-rollup-protocol">Rollup</a> and <a data-quicklook-from="arbitrum-anytrust-protocol">AnyTrust</a> protocols address this challenge by offloading some of the Ethereum network's heavy lifting to **another decentralized network of nodes** that support the <a data-quicklook-from="arbitrum-one">Arbitrum One</a> and <a data-quicklook-from="arbitrum-nova">Arbitrum Nova</a> L2 chains, respectively.

There are important differences between these chains. The choice between Rollup and AnyTrust represents a **tradeoff** between decentralization and performance:

- **Arbitrum One** implements the Rollup protocol, which stores raw transaction data on Ethereum L1, while
- **Arbitrum Nova** implements the AnyTrust protocol, which uses a <a data-quicklook-from='data-availability-committee-dac'>data availability committee (DAC)</a> to store raw transaction data, expediting settlement and reducing costs by introducing a security assumption.

**These two public chains will meet most projects' needs** - they already support thousands of apps and millions of users! But shared public chains aren't for everyone. Some projects can benefit from their own AnyTrust or Rollup chains that afford the same security, but with a higher degree of control over the chain's features and governance (remember, these public L2 chains and their protocols are governed by the [Arbitrum DAO](https://docs.arbitrum.foundation/gentle-intro-dao-governance)).

Orbit chains give you the ability to create your own AnyTrust and Rollup chains using your own infrastructure. You can think of your Orbit chain as a **self-managed priority lane on Ethereum**. Each Orbit chain is capable of supporting many times the capacity of Ethereum, all while benefitting directly from Ethereum's security.

Said simply:

- **Arbitrum One** and **Arbitrum Nova** chains unlocked two options that scale Ethereum and meet most projects' needs.
- **Arbitrum Orbit** chains unlock an **[infinite garden](https://ethereum.foundation/infinitegarden)** that scale Ethereum even further, with each individual Orbit chain being tailored precisely to its owner's needs.

### How does Orbit help me build decentralized apps?

| Benefit                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dedicated throughput**            | You may need dedicated throughput if your dApp demands high-performance or consistent resource availability. Running your dApp on its own Orbit chain significantly increases resource availability, so you don’t need to compete for computation and storage resources.                                                                                                                                                                                                                                                                     |
| **EVM+ compatibility**              | Orbit chains will benefit the same EVM+ compatibility that [Stylus](https://offchain.medium.com/hello-stylus-6b18fecc3a22) introduces. This means that you'll be able to deploy EVM-compatible smart contracts using Solidity, C, C++, and Rust - no need to migrate away from the language and toolchain that you're already using!                                                                                                                                                                                                         |
| **Independent product roadmap**     | If you want to decouple your app chain's roadmap from that of Ethereum and/or Arbitrum, Orbit makes this possible. This lets you implement cutting-edge features like account abstraction ahead of projects following Ethereum's public roadmap.                                                                                                                                                                                                                                                                                             |
| **Increased gas price reliability** | Many types of dApps rely on predictable transaction costs. Because Orbit chains are isolated from Arbitrum L2 and Ethereum L1 traffic, using Orbit chains means that you won't be significantly affected by other apps' on-chain activity, allowing your dApp's users to enjoy more reliable gas prices.                                                                                                                                                                                                                                     |
| **Account abstraction**             | Predictable gas prices make it easy to model and predict business costs, which makes it easier to experiment with traditionally cost-prohibitive mechanisms like **transaction fee subsidization**. This makes it easier to further abstract the technical complexity of decentralized apps away from end-user experiences, allowing you to deliver decentralized experiences that feel familiar to nontechnical audiences (who may not understand or care about implementation details).                                                    |
| **Custom gas token**                | Orbit chains can use alternative ERC-20 tokens as the native gas token on the network for gas fees, facilitating seamless integration with your app's ecosystem. This is currently supported for AnyTrust chains.                                                                                                                                                                                                                                                                                                                            |
| **Customizable protocol logic**     | You may need to modify the logic of your chain's settlement, execution, or governance protocols in order to meet specific requirements. Orbit's chains let you do this, while benefiting from the security of Ethereum, through Arbitrum's DAO-governed L2 chains.                                                                                                                                                                                                                                                                           |
| **Nitro extensibility**             | Orbit chains will have access to all Nitro code upgrades, feature additions, and improvements, giving your Orbit chain the option to stay up-to-date and incorporate the latest and greatest in Ethereum scaling technology.                                                                                                                                                                                                                                                                                                                 |
| **Decentralization options**        | You can build an <a data-quicklook-from='arbitrum-rollup-protocol'>Arbitrum Rollup</a> chain that uses Ethereum for data availability, or you can build an <a data-quicklook-from='arbitrum-anytrust-protocol'>Arbitrum AnyTrust</a> chain that uses a <a data-quicklook-from='data-availability-committee-dac'>Data Availability Committee (DAC)</a> to expedite the settlement of transactions to your Orbit chain's base chain, making things even cheaper for you and your end-users. Orbit chains can use either of these technologies. |
| **Low prototyping costs**           | Orbit chains can be easily created. See the [Orbit Quickstart](./orbit-quickstart) for step-by-step instructions.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Security**                        | Arbitrum technology powers the most secure L2s, and you can use this same mature technology stack for your Orbit chain.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Flexible technology options**     | Orbit lets you choose between Rollup, AnyTrust, or custom technology stacks. This makes Ethereum and Arbitrum technologies more adaptable by allowing you to incorporate only the elements of the technologies that you need.                                                                                                                                                                                                                                                                                                                |
| **Permissioned access**             | Orbit gives you the freedom to choose which contracts are deployed on your chain. You can keep it as open and permissionless as Ethereum, restrict contract deployment so that only your app can be deployed on this chain, or anything in between!                                                                                                                                                                                                                                                                                          |

### How does Orbit help the Ethereum ecosystem?

Orbit helps Ethereum move towards a **multi-chain future**. This is valuable for the following reasons:

| Value add                           | Description                                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scalability**                     | Multiple chains help overcome scaling bottlenecks by dividing activity into opt-in environments with separate resource management.                                                                                                                                                                                        |
| **Flexible security models**        | Different chains can experiment with different security models, allowing for tradeoffs. For example: Arbitrum One and Arbitrum Nova are both L2 chains, with Arbitrum Nova giving developers the ability to optimize for lower fees. With Arbitrum Orbit, extending the technology and experimenting is easier than ever. |
| **Flexible execution environments** | Different chains can experiment with more-or-less restrictive execution environments. For example, although Arbitrum chains are fully EVM compatible, Orbit chains can restrict smart contract functionality to optimize for your project's needs.                                                                        |
| **Flexible governance**             | Orbit chains let you define your own governance protocols.                                                                                                                                                                                                                                                                |

### Are Orbit chains the same thing as "app chains"?

It depends on your definition of "app chain". Orbit chains can be used as application-specific chains (often referred to as "app chains" or "appchains"). But **they aren't just for apps**. They're for **hosting EVM-compatible smart contracts using self-managed infrastructure that isolates compute resources away from Arbitrum's public L2 chains** based on your unique needs.

- You can use your Orbit chain to host the smart contracts that support one app, two apps, an ecosystem of apps, or no apps at all.
- You can use your Orbit chain to host a private, centralized service.
- Your Orbit chain can be special-purpose, general-purpose, and everything in-between.
- You could even build an app that uses multiple Orbit chains to support strange new forms of redundancy, high availability, and trustlessness.

### What's the best model: AnyTrust or Rollup?

The AnyTrust and Rollup data availability models reflect prioritization choices within the blockchain trilema (scalability vs. security vs. decentralization), so the best choice depends on what features matter most for your use-case.

Here's a short list to help you pick the model that works for you: 

#### I need my chain to be cost-efficient

- **AnyTrust:** By leveraging a Data Availability Committee (DAC), AnyTrust significantly reduces data availability costs compared to storing all data on Ethereum L1.

#### I need the most robust security model

- **Rollup:** By storing raw transaction data on Arbitrum One or Ethereum L1, Rollup chains inherit Ethereum's robust security model, offering high resilience against attacks.

#### I need my chain to use a custom gas token

- **AnyTrust:** The AnyTrust model allows you to use any `ERC-20` token for gas fees.

#### I want my chain to be fully trustless and decentralized

- **Rollup:** If your Rollup Orbit chain settles to Arbitrum One or Ethereum, it inherits the highest levels of trustlessness and decentralization of the Ethereum environment.

### Can my Orbit chain talk to other Orbit chains?

Yes! All Orbit chains are powered by self-managed nodes running their own instance of <a data-quicklook-from="arbitrum-nitro">Arbitrum Nitro</a>'s node software. This software implements both **AnyTrust** and **Rollup** protocols; your Orbit chain can be configured to use either.

This means that your Orbit chain **isn't a completely isolated blockchain network**. When you launch an Orbit chain, you’re joining an ecosystem of connected chains that can exchange information.

Our small-but-mighty team is hard at work developing tools and patterns that make it easy to launch natively interoperable Orbit chains. Interop features haven't been released just yet, but let us know if you need them - we'd like to learn from you as this capability matures.

Orbit's product roadmap is firmly aligned with Ethereum's vision of a decentralized web - one that makes it easy for users to carry their digital swords, spells, skins, art, tokens, and other assets across digital boundaries of all kinds, without having to worry about security, censorship, or UX friction.

### What should I know about Orbit's licensing?

L3 Orbit chains that settle to DAO-governed chains like Arbitrum One and Nova can be permissionlessly deployed without restrictions. For Orbit chains that are settling to any other Ethereum chain, the [Arbitrum Orbit Expansion program](https://forum.arbitrum.foundation/t/the-arbitrum-expansion-program-and-developer-guild/20722) creates a self-service path to launching. Via the permissionless revenue-sharing model of the program, Orbit chains are granted the rights to build customized L2s or L3s (or L4s and beyond) that settle to Ethereum directly or other Ethereum chains, such as optimistic rollups, zk-rollups, optimiums, and validiums.

### I'd love to tinker with Orbit! What should I do next?

Visit the [Orbit Quickstart](./orbit-quickstart.md), start tinkering, and let us know how it goes - we're excited to learn and grow with you! 🚀

### How can I launch an Orbit chain on mainnet?

While launching a chain on your own is possible, there are multiple infrastructure providers such as [Caldera](https://caldera.xyz/), [Conduit](https://conduit.xyz/), [AltLayer](https://altlayer.io/), and [Gelato](https://www.gelato.network/raas) that are enabling developers to quickly launch their own rollups.

[^1]: Although your Orbit chain will be able to exchange information with other Orbit chains (and the L2 chain that it settles to) by default, you're free to modify your Orbit chain's code as much as you'd like. You can even intentionally make your Orbit chain _incompatible_ with other Orbit chains and L2s.
