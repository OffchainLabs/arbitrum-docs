---
title: "A gentle introduction: Launch an L3 chain with Orbit"
description: "Launch your own L3 Arbitrum Orbit chain under the Arbitrum Nitro codebase's new licensing model. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (One or Nova). No need for permission from the Arbitrum DAO or Offchain Labs to create your L3. Modify the Nitro codebase freely for your L3. Stay tuned for more information."
author: oliviaJ3388
sidebar_position: 1
sidebar_label: "A gentle introduction: Arbitrum Orbit"
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial />


### In a nutshell:

- Arbitrum Orbit lets you **create your own blockchains** that settle to Arbitrum's L2 chains.
- Orbit L3 chains benefit from Arbitrum's continuous improvements to the Nitro codebase.
- **You own your Orbit chain(s)** and can customize their governance[^1].
- Examples of possibilities that this unlocks:
    - **Launch a sovereign Nitro chain** that benefits from Nitro's fraud proofs, advanced compression, EVM-compatibility, and EVM-extensibility.
    - **Build a special-purpose app chain** with dedicated throughput and traffic isolation for increased gas price reliability.
    - **Permission access** to control who can read and write chain data, who can deploy smart contracts, etc.
    - **Fork the AnyTrust protocol** and run your own modified version of the Arbitrum Nova chain with your own fee token and data availability committee.
- Get started by **visiting the [Orbit Quickstart](./quickstart-launch-l3-chain.md)**, **exploring the docs**, or **[reaching out to the Offchain Labs team on Discord](#todo)** for support and guidance.


### What's Orbit?
 
import { MermaidWithHtml, Nodes, Node, Connection, NodeDescriptions, NodeDescription } from '/src/components/MermaidWithHtml/MermaidWithHtml';

<MermaidWithHtml>
  <Nodes>
    <Node id="1">Orbit (L3)</Node>
    <Node id="2">Orbit (L3)</Node>
    <Node id="3">Orbit (L3)</Node>
    <Node id="4">Orbit (L3)</Node>
    <Node id="5">One (L2)</Node>
    <Node id="6">Nova (L2)</Node>
    <Node id="7">Ethereum (L1)</Node>
    <Connection from="1" to="5"/>
    <Connection from="2" to="5"/>
    <Connection from="3" to="6"/>
    <Connection from="4" to="6"/>
    <Connection from="5" to="7"/>
    <Connection from="6" to="7"/>
  </Nodes>
  <NodeDescriptions>
    <NodeDescription for='1,2'><strong>Arbitrum Orbit</strong> is a new technology that lets you create public or private application-specific Layer 3 (L3) chains.<br/><br/>All Orbit L3 chains settle to either Arbitrum One or Arbitrum Nova, which both settle to Ethereum.</NodeDescription>
    <NodeDescription for='3,4'><strong>Arbitrum One</strong> and <strong>Arbitrum Nova</strong> are public Layer 2 (L2) chains.</NodeDescription>
    <NodeDescription for='5'><strong>Ethereum</strong> is a public Layer 1 (L1) chain.</NodeDescription>
  </NodeDescriptions>
</MermaidWithHtml>


- In the context of Arbitrum's ecosystem, **Orbit L3 chains are those that settle onto Arbitrum's L2 chains**.
- You can think of Orbit L3 chains as **deployable, configurable forks of Arbitrum's L2 technology stack** that are tightly coupled to Arbitrum's L2 chains.
- You can also think of them as **app chains** - special-purpose chains that implement only those pieces of the Arbitrum technology stack that your app needs.
- This gives you another way to **progressively decentralize** your applications, incrementally adopting the properties and security assumptions of Ethereum's base layer, all while benefiting from Arbitrum's continuous improvements.
- Note that Arbitrum One and Arbitrum Nova implement the <a data-quicklook-from='arbitrum-rollup-protocol'>Arbitrum Rollup</a> and <a data-quicklook-from='arbitrum-anytrust-protocol'>AnyTrust</a> protocols, respectively. Both of these chains (and their underlying protocols) are owned and governed by the Arbitrum DAO. With Orbit L3 chains, you decide how to govern your chain[^2].


### What problem does Orbit solve?

The Ethereum ecosystem is supported by a decentralized network of nodes that each run Ethereum's Layer 1 (L1) client software. The network occasionally becomes congested, resulting in unpredictable gas fees. This negatively affects developers who want to build fast, consistently affordable end-user experiences.

Layer-2 (L2) scaling solutions like Arbitrum Rollup and AnyTrust solve this problem by offloading some of Ethereum Mainnet's work to another “layer” of networked nodes that do the same work in the same way, but on their own chains - Arbitrum One and Arbitrum Nova, respectively. The choice between One and Nova represents a **tradeoff** between decentralization and performance[^3].

Some teams aren't yet able to adopt either of these chains because the underlying mechanisms (chain protocols, governance mechanisms, permissioning, etc) don't offer enough flexibility. These teams need a higher degree of configurability, interoperability, and/or ownership over their chains; they need more tradeoffs to choose from. This is the problem that Arbitrum Orbit solves.


### How does Orbit help me build decentralized apps?

*// todo - give examples of app chains like Ronin; highlight engineering LOE; frame this as a battle-tested framework / abstraction / easy button*



| Benefit                             | Description                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dedicated throughput**            | You may need dedicated throughput if your dApp demands high-performance or consistent resource availability. Running your dApp on its own Orbit chain significantly increases resource availability, so you don’t need to compete for computation and storage resources.                                                                                                                          |
| **EVM+ compatibility**              | Like Arbitrum One and Nova, Orbit L3 chains benefit from EVM+ compatibility. This means that you can deploy EVM-compatible smart contracts and also, with Stylus, C, C++, and Rust smart contracts.                                                                                                                                                                                               |
| **Independent product roadmap**     | If you want to decouple your app chain's roadmap from that of Ethereum and/or Arbitrum, Orbit makes this possible.                                                                                                                                                                                                                                                                                |
| **Increased gas price reliability** | Many types of dApps rely on predictable transaction costs. Because Orbit chains are isolated from Arbitrum L2 and Ethereum L1 traffic, using Orbit L3 chains means that you can guarantee reliable gas prices for your dApp's users.                                                                                                                                                              |
| **Account abstraction**             | Predictable gas prices make alternative cost models more feasible, such as fee subsidization. This makes it easier to further abstract the technical complexity of decentralization away, allowing you to deliver familiar experiences to nontechnical audiences.                                                                                                                                 |
| **Customizable fee token**          | Orbit chains can use a custom fee token, or even an existing token as a fee token, facilitating seamless integration with your dApp's ecosystem.                                                                                                                                                                                                                                                  |
| **Customizable protocol logic**     | You may need to modify the logic of your chain's settlement, execution, or governance protocols in order to meet specific requirements. Orbit's L3 chains let you do this, while settling to Ethereum L1, through Arbitrum's DAO-governed L2 chains.                                                                                                                                              |
| **Nitro extensibility**             | Orbit chains that implement the AnyTrust and Rollup protocols will be continuously upgraded as improvements are made, allowing your app chain to apply the same updates that the Arbitrum One and Nova chains receive.                                                                                                                                                                            |
| **Chain composability**             | DApps built on Orbit L3 chains can submit transactions that settle to Arbitrum L2 chains, but they can also _________.                                                                                                                                                                                                                                                                            |
| **Decentralization options**        | Arbitrum Rollup is exactly as decentralized and trustless as Ethereum; it introduces no additional trust assumptions. Arbitrum AnyTrust introduces the assumption that you can trust its Data Availability Committee to expedite the settlement of transactions to Ethereum's L1. Orbit L3 chains let you introduce your own additional trust assumptions to meet specific needs, or none at all. |
| **Low upfront setup costs**         | Orbit L3 AnyTrust and Rollup chains can be created quickly and cheaply (todo - support this claim with numbers).                                                                                                                                                                                                                                                                                  |
| **Security**                        | Orbit chains offer the same level of security as AnyTrust and Rollup chains by default, unless the tech stack is customized.                                                                                                                                                                                                                                                                      |
| **Flexible technology options**     | Orbit lets you choose between Rollup, AnyTrust, or custom technology stacks. This makes Ethereum and Arbitrum technologies more valuable by allowing you to incorporate only the elements of the technologies that you need.                                                                                                                                                                      |
| **Permissioned access**             | Orbit lets you enforce transaction submission and contract deployment restrictions, ensuring compliance with relevant rules and regulations.                                                                                                                                                                                                                                                      |



### How does Orbit help the Ethereum ecosystem?

Orbit helps Ethereum move towards a **multi-chain future**. This is valuable for the following reasons:

| Value add                           | Description                                                                                                                                                                                                                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scalability**                     | Multiple chains help overcome scaling bottlenecks by dividing activity into opt-in environments with separate resource management.                                                                                                                                                |
| **Flexible security models**        | Different chains can experiment with various security models, allowing for tradeoffs. For example: Arbitrum One and Arbitrum Nova are both L2 chains, with Arbitrum Nova giving developers the ability to optimize for lower fees.                                                |
| **Flexible execution environments** | Different chains can experiment with more-or-less restrictive execution environments that allow for tradeoffs. For example, although Arbitrum chains are fully EVM compatible, Orbit L3 chains can restrict smart contract functionality to optimize for performance or security. |
| **Flexible governance**             | Orbit L3 chains let you create new Arbitrum chains beholden to governance mechanisms that you determine for your own needs, unlocking a rich, diverse plurality of interoperable Ethereum ecosystems.                                                                             |
| **Increased adoption of dApps**     | Orbit's optionality reduces the cost of progressive decentralization for devs, unlocking a new category of decentralized apps that are built under more autonomous, self-managed conditions.                                                                                      |


:::danger

Content and structure below this line is in rough shape - will be updated soon.

:::


### There are a lot of chains to choose from! How do I pick one?

Use the following table to determine which offering meets your needs:


| Property                    | Orbit Rollup | Orbit AnyTrust | One    | Nova     | Ethereum |
| --------------------------- | ------------ | -------------- | ------ | -------- | -------- |
| Layer                       | 3            | 3              | 2      | 2        | 1        |
| Protocol                    | Rollup       | AnyTrust       | Rollup | AnyTrust | Ethereum |
| Underlying tech stack       |              |                |        |          |          |
| Governance                  |              |                |        |          |          |
| Data Availability Committee |              |                |        |          |          |
| Throughput                  |              |                |        |          |          |
| Licensing                   |              |                |        |          |          |
| Ownership                   |              |                |        |          |          |
| Permissioning               |              |                |        |          |          |
| EVM+ compatibility          |              |                |        |          |          |
| Configurability             |              |                |        |          |          |
| Sovereignty                 |              |                |        |          |          |
| Gas price reliability       |              |                |        |          |          |
| Fee tokens                  |              |                |        |          |          |
| Access to liquidity         |              |                |        |          |          |
| Scalability                 |              |                |        |          |          |
| Traffic isolation           |              |                |        |          |          |
| Nitro upgrades              |              |                |        |          |          |
| Chain composability:        |              |                |        |          |          |
| Decentralization options    |              |                |        |          |          |
| Upfront costs               |              |                |        |          |          |
| Security model              |              |                |        |          |          |
| Regulatory compliance       |              |                |        |          |          |


<!--
 - Orbit chains offer the ability to customize gas speed limit and gas price floor, providing scalability while maintaining isolation from public blockchains.
 - Orbit chains can access liquidity on Arbitrum One or Nova through fast bridging providers or other liquidity solutions.
 - Developers can choose a custom fee token for their Orbit chain.
 - Orbit chains are isolated from traffic congestion on Arbitrum L2s, ensuring more reliable gas prices.
 - Dedicated. Orbit provides isolated activity from other projects, so there is no need to compete for computation and storage resources.
 Developers can allowlist validators and select a data availability committee for their Orbit chain.                                                     
 Orbit chains have lower upfront setup costs for AnyTrust and Rollup compared to customizing the Nitro Tech stack.                                       
 Orbit chains maintain the same trust assumptions as Arbitrum One and Nova, unless the tech stack is customized.                                         
 If L1/L2 solutions don't meet regulatory compliance needs, you can permission your Orbit chains to comply with regulatory requirements such as AML/KYC. 
-->


### What are some caveats and considerations that I should keep in mind as I evaluate Orbit for my project?

*// todo*

- **Licensing**
- **Scalability**
- **Settlement and Execution**
- **Trust Assumptions**
- **Permissions**
- **Transaction Costs and Throughput**
- **Ownership and Extensibility**
- **Traffic Isolation and Gas Price Reliability**
- **Setup and Ongoing Costs**
- **Access to Liquidity and Chain Composability**
- **Configurability and Decentralization**
- **Fee Token**
- **Roadmap**


### How are decisions about Orbit's product development (scope, roadmap, priority) made? Are they DAO decisions?

*// todo*



### Why should I choose Orbit over alternative solutions?

*// todo - comparison table highlighting most compelling contrasts*




### If I create an Orbit L3 chain, am I on the hook for hosting and maintenance?


*// todo: IaaS vs PaaS; comparisons with other models readers will find familiar*

<!-- 
- is it more like IaaS, or does Arbitrum host and maintain the L3 chains under some convenient abstractions, like a PaaS provider?
- What elements of the L3 deployment will be L2 on-chain, vs on off-chain infrastructure?
- Will I own the smart contracts that bridge between my L3 chain and the L2 chain?
- Will I need to run my own nodes?
- Will Offchain host my chain for me?
- Will Offchain update my chain for me?
-->


### I'd love to tinker with Orbit! What should I do next?

- Visit the **Orbit Quickstart** to get started.
- Visit one of our **how-tos** for procedural guidance that walks you through specific tasks with your Orbit deployment:
    - todo
- Visit one of our **conceptual documents** for an educational introduction to Orbit's underlying technology:
    - todo



[^1]: See [Arbitrum DAO docs](https://docs.arbitrum.foundation/new-arb-chains) for more info on the Arbitrum DAO's role in governing L2s.
[^2]: Similar to how Arbitrum L2 chains are impacted by decisions made through Ethereum L1's governance mechanisms, Orbit L3 chains are impacted by decisions made through Arbitrum DAO's governance mechanisms. Orbit L3 chains aren't entirely decoupled from Arbitrum L2, but they're effectively sovereign chains that settle to DAO-governed L2 chains.
[^3]: A game developer may prioritize performance over decentralization while requiring an Ethereum-grade settlement layer. They'd probably select Arbitrum Nova over Arbitrum One because Arbitrum Nova's AnyTrust protocol introduces a small degree of democratically managed centralization that expedites the L2 chain's posting of transaction data back down to Ethereum's L1 chain, reducing time-to-finality. AnyTrust chains trade decentralization for performance, while Rollup chains (like One) maintain Ethereum-grade decentralization.