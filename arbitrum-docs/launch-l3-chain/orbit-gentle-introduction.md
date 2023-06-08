---
title: "A gentle introduction: Orbit appchains"
sidebar_label: "A gentle introduction: Orbit appchains"
description: "Launch your own Arbitrum Orbit appchain under the Arbitrum Nitro codebase's new licensing model. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (Goerli for now; One or Nova soon). No need for permission from the Arbitrum DAO or Offchain Labs to create your Orbit appchain. Modify the Nitro codebase freely for your Orbit appchain."
author: oliviaJ3388
sidebar_position: 1
---

:::info PUBLIC PREVIEW DOCUMENT

This document is currently in **public preview** and may change significantly as feedback is captured from readers like you. Click the *Request an update* button at the top of this document or [join the Arbitrum Discord](https://discord.gg/arbitrum) to share your feedback. (TODO: Link to specific channel)

:::


### In a nutshell:

- Arbitrum Orbit lets you **create your own special-purpose, application-specific chain (appchain)** that settles to Arbitrum's L2 chains (<a data-quicklook-from='arbitrum-one'>Arbitrum One</a> and <a data-quicklook-from="arbitrum-nova">Arbitrum Nova</a>).
- **You own your Orbit appchain** and can customize its privacy, permissions, fee token, governance[^1], and more.
- Examples of possibilities that this unlocks:
    - **Launch an appchain that you own** which inherits <a data-quicklook-from='arbitrum-nitro'>Nitro</a>'s fraud proofs, advanced compression, EVM+ compatibility, and continuous improvements.
    - **Offer gas price reliability** to your end-users thanks to the dedicated throughput and traffic isolation that Orbit appchains offer by default.
    - **Permission access** to control who can access your appchain's data, and who can deploy smart contracts to your chain. Your appchain can be completely permissionless like Ethereum and Arbitrum One, or you can add your own custom permissions policy.
    - **Collect fees using a token that you choose** to rapidly iterate on domain-specific mechanism designs and value capture opportunities.
- Get started by **visiting the [Orbit Quickstart](./orbit-quickstart.md)**, **exploring the docs**, or **[reaching out to the Offchain Labs team on Discord](#todo)** for support and guidance.


### What's Orbit?
 
import { MermaidWithHtml, Nodes, Node, Connection, NodeDescriptions, NodeDescription } from '/src/components/MermaidWithHtml/MermaidWithHtml';

<MermaidWithHtml>
  <Nodes>
    <Node id="1">Appchain</Node>
    <Node id="2">Appchain</Node>
    <Node id="3">Appchain</Node>
    <Node id="4">Appchain</Node>
    <Node id="5">Arbitrum Goerli (L2)</Node>
    <Node id="6">Arbitrum One & Nova (L2)</Node>
    <Node id="7">Ethereum (L1)</Node>
    <Connection from="1" to="5"/>
    <Connection from="2" to="5"/>
    <Connection from="3" to="6"/>
    <Connection from="4" to="6"/>
    <Connection from="5" to="7"/>
    <Connection from="6" to="7"/>
  </Nodes>
  <NodeDescriptions>
    <NodeDescription for='1,2'><strong>Arbitrum Orbit</strong> is a new technology that lets you create public or private application-specific chains (appchains).<br/><br/>All Orbit appchains settle to either Arbitrum One, Arbitrum Nova, or Arbitrum Goerli.</NodeDescription>
    <NodeDescription for='3,4'><strong>Arbitrum One</strong>, <strong>Arbitrum Nova</strong>, and <strong>Arbitrum Goerli</strong> are public Layer 2 (L2) chains. Note that currently, Orbit chains are local devnets that settle to Arbitrum Goerli.</NodeDescription>
    <NodeDescription for='5'><strong>Ethereum</strong> is a public Layer 1 (L1) chain.</NodeDescription>
  </NodeDescriptions>
</MermaidWithHtml>


- In the context of Arbitrum's ecosystem, **Orbit appchains are those that settle to one of Arbitrum's L2 chains**.
- You can think of Orbit chains as **deployable, configurable forks of Arbitrum's L2 Nitro technology stack** that are tightly coupled to Arbitrum's L2 chains.
- You can also think of them as **app-specific chains** - special-purpose chains that implement only those pieces of the Arbitrum technology stack that your app needs.
- This gives you another way to **progressively decentralize** your applications, incrementally adopting the properties and security assumptions of Ethereum's base layer.
- It also lets you continuously integrate improvements made to the Arbitrum Nitro stack (the code that powers the nodes that power Arbitrum's L2 and Orbit chains).
- Note that Arbitrum One and Arbitrum Nova implement the <a data-quicklook-from='arbitrum-rollup-protocol'>Arbitrum Rollup</a> and <a data-quicklook-from='arbitrum-anytrust-protocol'>AnyTrust</a> protocols, respectively. An Orbit chain can similarly be configured in either Rollup mode or AnyTrust mode — it’s your choice!
- Arbitrum One and Arbitrum Nova are owned and governed by the Arbitrum DAO. With Orbit chains, you decide how to govern your chain.


### What problem does Orbit solve?

The Ethereum ecosystem is supported by a decentralized network of nodes that each run Ethereum's Layer 1 (L1) client software. While Ethereum is the most decentralized and secure smart contract platform, it’s block space is in high demand, and fees often price out users or applications.

Layer 2 (L2) scaling solutions like Arbitrum Rollup and AnyTrust solve this problem by optimizing their use of Ethereum. They put just enough data on Ethereum to inherit its security but move a lot of the heavy lifting off-chain.

While both Rollups and AnyTrust offload lots of transaction data from Ethereum, they have important differences. Rollups put all of the raw transaction data on Ethereum, whereas AnyTrust chains settle on Ethereum but utilize a data-availability committee (DAC) to store raw transaction data. The choice between Rollups and AnyTrust represents a tradeoff between decentralization and performance; Arbitrum One is a Rollup chain and Arbitrum Nova is an AnyTrust chain.

While Arbitrum One and Nova provide excellent environments for scaling most applications — and are home to thousands of apps and millions of users, shared public chains are not for everyone. Some projects can benefit from their own high-security low-cost chain.

You can think of an Orbit chain as a dedicated priority lane on Ethereum. And each of these priority lanes has many times the capacity of Ethereum, but piggyback on Ethereum for security.


### How does Orbit help me build decentralized apps?


| Benefit                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dedicated throughput**            | You may need dedicated throughput if your dApp demands high-performance or consistent resource availability. Running your dApp on its own Orbit chain significantly increases resource availability, so you don’t need to compete for computation and storage resources.                                                                                                                                                                                                                                                    |
| **EVM+ compatibility**              | Like Arbitrum One and Nova, Orbit chains benefit from EVM+ compatibility. This means that you can deploy EVM-compatible smart contracts using Solidity and - with the upcoming launch of Stylus - C, C++, and Rust.                                                                                                                                                                                                                                                                                                         |
| **Independent product roadmap**     | If you want to decouple your app chain's roadmap from that of Ethereum and/or Arbitrum, Orbit makes this possible. This lets you implement cutting-edge features like account abstraction ahead of projects following Ethereum's public roadmap.                                                                                                                                                                                                                                                                            |
| **Increased gas price reliability** | Many types of dApps rely on predictable transaction costs. Because Orbit chains are isolated from Arbitrum L2 and Ethereum L1 traffic, using Orbit chains means that you won't be significantly affected by other apps' on-chain activity, allowing your dApp's users to enjoy more reliable gas prices.                                                                                                                                                                                                                    |
| **Account abstraction**             | Predictable gas prices make alternative cost models more feasible, such as fee subsidization. This makes it easier to further abstract the technical complexity of decentralization away, allowing you to deliver familiar experiences to nontechnical audiences.                                                                                                                                                                                                                                                           |
| **Customizable fee token**          | Orbit chains can use any token you choose as the fee token, facilitating seamless integration with your dApp's ecosystem.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Customizable protocol logic**     | You may need to modify the logic of your chain's settlement, execution, or governance protocols in order to meet specific requirements. Orbit's chains let you do this, while edit: benefiting from the security of Ethereum, through Arbitrum's DAO-governed L2 chains.                                                                                                                                                                                                                                                    |
| **Nitro extensibility**             | Orbit chains will have access to all Nitro code upgrades, feature additions, and improvements, giving your appchain the option to stay up-to-date and incorporate the latest and greatest in Ethereum scaling technology.                                                                                                                                                                                                                                                                                                   |
| **Decentralization options**        | You can build an <a data-quicklook-from='arbitrum-rollup'>Arbitrum Rollup</a> appchain that uses Ethereum for data-availability, or you can build an <a data-quicklook-from='arbitrum-anytrust'>Arbitrum AnyTrust</a> chain that uses a <a data-quicklook-from='data-availability-committee-dac'>Data Availability Committee (DAC)</a> to expedite the settlement of transactions to your appchain's base chain, making things even cheaper for you and your end-users. Orbit appchains can use both of these technologies. |
| **Low upfront setup costs**         | Orbit appchains can be easily created. See the [Orbit Quickstart](./orbit-quickstart.md).                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Security**                        | Arbitrum technology powers the most secure L2s, and you can use this same mature technology stack for your appchain.                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Flexible technology options**     | Orbit lets you choose between Rollup, AnyTrust, or custom technology stacks. This makes Ethereum and Arbitrum technologies more valuable by allowing you to incorporate only the elements of the technologies that you need.                                                                                                                                                                                                                                                                                                |
| **Permissioned access**             | Orbit gives you the freedom to choose which contracts are deployed on your chain. You can keep it as open and permissionless as Ethereum, restrict contract deployment so that only your app can be deployed on this chain, or anything in between!                                                                                                                                                                                                                                                                         |


### How does Orbit help the Ethereum ecosystem?

:::warning Editor's note

There was some feedback RE the below table being repetitive. There was also feedback on its content. Its purpose is to communicate, as a contrast to the above table which focuses on value-for-devs, how Orbit provides value to the broader Ethereum ecosystem. We can cut if anyone feels strongly about it (there's a big fuzzy line between repetition and reinforcement).

:::


Orbit helps Ethereum move towards a **multi-chain future**. This is valuable for the following reasons:

| Value add                           | Description                                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scalability**                     | Multiple chains help overcome scaling bottlenecks by dividing activity into opt-in environments with separate resource management.                                                                                                                                                                                        |
| **Flexible security models**        | Different chains can experiment with different security models, allowing for tradeoffs. For example: Arbitrum One and Arbitrum Nova are both L2 chains, with Arbitrum Nova giving developers the ability to optimize for lower fees. With Arbitrum Orbit, extending the technology and experimenting is easier than ever. |
| **Flexible execution environments** | Different chains can experiment with more-or-less restrictive execution environments. For example, although Arbitrum chains are fully EVM compatible, Orbit appchains can restrict smart contract functionality to optimize for performance or security.                                                                  |
| **Flexible governance**             | Orbit appchains let you create new Arbitrum chains with governance that you define.                                                                                                                                                                                                                                       |
| **Increased adoption of dApps**     | Orbit's optionality reduces the cost of progressive decentralization for devs, unlocking a new category of decentralized apps that are built under more autonomous, self-managed conditions.                                                                                                                              |



### What should I know about Orbit's licensing?

Arbitrum Orbit chains can be built on top of Arbitrum One or Arbitrum Nova, and developers are granted full permission to modify and adapt the Arbitrum Nitro codebase to meet their custom needs. Moreover, the license granted for Arbitrum Nova chains is both **perpetual** and **recursive**: 

- **perpetual** — nobody can ever take the software license away from you
- **recursive** — your Arbitrum Orbit appchain can itself host other appchains governed by the same license

The Arbitrum Orbit program does not automatically include chains that settle to a non-Arbitrum-DAO-governed chain. So if you want to launch an Arbitrum Nitro chain as an independent L2 on Ethereum, you’ll need to get a custom license. There are two options for this: 

 1. **Ask Offchain Labs**: Offchain Labs, as the initial developer of the Arbitrum Nitro codebase, is the licensor of the software, and can grant custom licenses. 
 2. **Propose to the Arbitrum DAO**: With the launch of the Arbitrum DAO, the DAO was also given co-licensor rights to approve additional L2s on Ethereum that do not settle to a DAO-governed chain. To utilize this mechanism, you’ll need to submit a proposal to the Arbitrum DAO, and the DAO will democratically decide whether or not to grant the license for your proposed L2 chain.


### I'd love to tinker with Orbit! What should I do next?

- Visit the [Orbit Quickstart](./orbit-quickstart.md) to get started.



[^1]: See [Arbitrum DAO docs](https://docs.arbitrum.foundation/new-arb-chains) for more info on the Arbitrum DAO's role in governing L2s.