---
title: "A gentle introduction: Launch an L3 chain with Orbit"
description: "Launch your own L3 Arbitrum Orbit chain under the Arbitrum Nitro codebase's new licensing model. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (One or Nova). No need for permission from the Arbitrum DAO or Offchain Labs to create your L3. Modify the Nitro codebase freely for your L3. Stay tuned for more information."
author: oliviaJ3388, symbolpunk
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial />


### In a nutshell:

- **Arbitrum Orbit** is a new product offering that lets you create **configurable app chains** that settle to Arbitrum's L2 chains.
- This means that you can now:
    - Launch a chain with **dedicated throughput** and **traffic isolation** for increased **gas price reliability**.
    - **Launch your own rollup protocol** on top of the Nitro stack.
    - **Fork the AnyTrust protocol** and run your own modified version of Arbitrum Nova chain with your own fee token.
    - **Permission access** to your chain to comply with regulatory frameworks and KYC requirements.
    - ...many other things. See below for more details.
- While Arbitrum One and Arbitrum Nova are governed by the Arbitrum DAO[^1], **you own your Orbit chain(s)** and can **customize their governance**.
- Get started by **visiting the Orbit Quickstart**, **exploring the docs**, or **reaching out to our team** for support and guidance.

### What's Orbit?

- **Ethereum Mainnet** is a Layer 1 (L1) chain; Arbitrum One and Arbitrum Nova are Layer 2 (L2) chains; **Arbitrum Orbit** is a new technology that lets you create Layer 3 (L3) chains.
- In the context of Arbitrum's ecosystem, **L3 chains are those that settle onto Arbitrum's L2 chains**.
- You can think of Orbit L3 chains as **deployable, configurable forks of Arbitrum's L2 technology stack** that are tightly coupled to Arbitrum's L2 chains.
- You can also think of them as **app chains** - special-purpose chains that implement only those pieces of the Arbitrum technology stack that you want.
- This gives you another way to **progressively decentralize** your applications, incrementally adopting the properties and security assumptions of Ethereum's base layer, all while benefiting from Arbitrum's continuous improvements.
- Note that Arbitrum One and Arbitrum Nova implement the Arbitrum Rollup and AnyTrust protocols, respectively. Both the chains and the underlying protocols are owned and governed by the Arbitrum DAO. With Orbit L3 chains, you decide how to govern your chain, and you can even customize the underlying protocol stack.


*// todo: minimum-viable diagram to get to “ah ha!” instantly*


### What problem does Orbit solve?

The Ethereum ecosystem is supported by a decentralized network of nodes that each run Ethereum's Layer 1 (L1) client software. This network occasionally becomes congested, resulting in unpredictable gas fees. This negatively affects developers who want to build fast, consistently affordable end-user experiences.

Layer-2 (L2) scaling solutions like Arbitrum Rollup and AnyTrust solve this problem by offloading some of Ethereum Mainnet's work to another “layer” of networked nodes that do the same work in the same way, but on their own chains - Arbitrum One and Arbitrum Nova, respectively. The choice between One and Nova represents a **tradeoff** between decentralization and performance[^2].

Arbitrum's L2 `decentralization:performance` lever meets many teams' needs, but some teams ready to fully adopt the One or Nova chains because the underlying mechanisms (chain protocols, governance mechanisms, permissioning, etc) don't satisfy business or regulatory requirements. These teams need a higher degree of configurability and ownership over their chains; they need more levers and tradeoffs to choose from. This is the problem that Arbitrum Orbit solves.


### How does Orbit help the Ethereum ecosystem?

Orbit helps Ethereum move towards a **multi-chain future**. This is valuable for the following reasons:

| Value add                           | Description                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scalability through isolation**   | Orbit lets teams build special-purpose sidechains that use Arbitrum and Ethereum only as-needed. This multiple-chain environment helps overcome scaling bottlenecks by dividing activity into opt-in environments that manage their own resources.                                                        |
| **Flexible security models**        | Different chains can experiment with novel security models, allowing for trade-offs. For example: Arbitrum One and Arbitrum Nova are both L2 chains, with Arbitrum Nova giving developers the ability to optimize for lower fees. Orbit L3 chains let you optimize for all kinds of things.               |
| **Flexible execution environments** | Different chains can experiment with more-or-less restrictive execution environments that allow for trade-offs. For example, although Arbitrum chains are fully EVM compatible, app-specific Orbit chains can restrict smart contract functionality to optimize for performance or security.              |
| **Flexible permission**             | Arbitrum's canonical chains (One and Nova) are beholden to the Arbitrum DAO's governance decisions. Orbit L3 chains let you create new Arbitrum chains beholden to governance mechanisms that you determine for your own needs, unlocking a rich, diverse plurality of interoperable Ethereum ecosystems. |
| **Increased adoption of dApps**     | Orbit's optionality reduces the cost of progressive decentralization for devs, unlocking a new category of decentralized apps that are built under more autonomous, self-managed conditions.                                                                                                              |


<br/>

### How does Orbit help developers?

For individual developers and teams, Orbit unlocks the following features:


*// todo: rearticulate as features & value props? maybe?*


| Feature                             | Value prop                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dedicated throughput**            | You may need dedicated throughput if your dApp demands high-performance or consistent resource availability. Running your dApp on a custom Orbit chain isolates your dApp's activity from other projects (eg those using Arbitrum L2 chains or Ethereum Mainnet directly), so there's no need to compete for computation and storage resources.                                                                                                                                 |
| **Permissioned access**             | You might require permissioned access if you need to adhere to specific regulatory frameworks or AML/KYC requirements. Orbit lets you enforce transaction submission and contract deployment restrictions, ensuring compliance with relevant rules and regulations.                                                                                                                                                                                                             |
| **EVM+ compatibility**              | You could benefit from EVM+ compatibility if your dApp requires support for multiple programming languages. Orbit not only accommodates EVM-compatible smart contract code but also, with Stylus, supports C, C++, and Rust languages.                                                                                                                                                                                                                                          |
| **Independent product roadmap**     | If you want to decouple your app chain's roadmap from that of Ethereum and/or Arbitrum, Orbit makes this possible.                                                                                                                                                                                                                                                                                                                                                              |
| **Increased gas price reliability** | Many types of dApps rely on predictable transaction costs. Because Orbit chains are isolated from Arbitrum L2 and Ethereum L1 traffic, using Orbit L3 chains means that you can guarantee reliable gas prices for your dApp's users.                                                                                                                                                                                                                                            |
| **Account abstraction**             | Predictable gas prices make alternative cost models more feasible, such as fee subsidization. This makes it easier to further abstract the technical complexity of decentralization away, allowing you to deliver familiar experiences to nontechnical audiences.                                                                                                                                                                                                               |
| **Customizable fee token**          | Orbit chains can use a custom fee token, or even an existing token as a fee token, facilitating seamless integration with your dApp's ecosystem.                                                                                                                                                                                                                                                                                                                                |
| **Customizable protocol logic**     | You may need to modify the logic of your chain's settlement, execution, or governance protocols in order to meet specific regulatory or business requirements. Orbit's L3 chains let you do this, while settling to Ethereum L1, through Arbitrum's DAO-governed L2 chains.                                                                                                                                                                                                     |
| **Access to liquidity**             | If your dApp relies on liquidity, Orbit chains can be configured to connect to Arbitrum One or Nova through fast bridging providers or other liquidity solutions.                                                                                                                                                                                                                                                                                                               |
| **Nitro extensibility**             | Orbit chains that implement the AnyTrust and Rollup protocols will be continuously upgraded as improvements are made, allowing your app chain to apply the same updates that the Arbitrum One and Nova chains receive.                                                                                                                                                                                                                                                          |
| **Chain composability**             | DApps built on Orbit L3 chains can submit transactions that settle to Arbitrum L2 chains, but they can also _________.                                                                                                                                                                                                                                                                                                                                                          |
| **Decentralization options**        | Arbitrum Rollup is fully trustless; Arbitrum AnyTrust introduces a Data Availability Committee to expedite the settlement of transactions to Ethereum's L1. Orbit L3 chains let you tailor your tradeoffs to specific scenarios, including scenarios that demand performance more than Ethereum-grade decentralization. You can allowlist and denylist specific validators, committee members, or participants in novel mechanisms that align with your project's requirements. |
| **Low upfront setup costs**         | If you're looking to minimize initial expenses when launching an app chain, Orbit L3 chains are a cost-competitive way to spin up an AnyTrust or Rollup chain without having to customize the Nitro stack yourself.                                                                                                                                                                                                                                                             |
| **Security**                        | Orbit chains offer the same level of security as AnyTrust and Rollup chains by default, unless the tech stack is customized.                                                                                                                                                                                                                                                                                                                                                    |
| **Flexible technology options**     | Orbit lets you choose between Rollup, AnyTrust, or custom technology stacks. This makes Ethereum and Arbitrum technologies more valuable by allowing you to incorporate only the elements of the technologies that you need.                                                                                                                                                                                                                                                    |



### If I create an Orbit chain, am I on the hook for hosting and maintenance?

*// todo: is it more like IaaS, or does Arbitrum host and maintain the L3 chains under some convenient abstractions, like a PaaS provider?*

- Will Offchain host my chain for me?
- Will Offchain update my chain for me?


### How do I decide between Ethereum (L1) / Arbitrum One (L2) / Arbitrum Nova (L2) / Orbit (L3)?

Use the following table to determine which offering meets your needs:

*// todo: rearticulate as needs-oriented, add checkmarks with asterisks as-needed*


| Need                        | Arbitrum Orbit (L3)                                                                                                                                         | Arbitrum Nova (L2) | Arbitrum One (L2) | Ethereum L1 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------- | ----------- |
| Protocol                    | AnyTrust or Rollup                                                                                                                                          | AnyTrust           | Rollup            |             |
| Underlying tech stack       | Nitro, or a fork of Nitro that you manage                                                                                                                   | Nitro              | Nitro             |             |
| Governance                  |                                                                                                                                                             |                    |                   |             |
| Data Availability Committee |                                                                                                                                                             |                    |                   |             |
| Throughput                  | Dedicated. Orbit provides isolated activity from other projects, so there is no need to compete for computation and storage resources.                      |                    |                   |             |
| Licensing                   |                                                                                                                                                             |                    |                   |             |
| Ownership                   |                                                                                                                                                             |                    |                   |             |
| Permissioning               | Orbit allows for permissioning of transaction submissions and contract deployments, which can be useful for compliance with regulatory frameworks.          |                    |                   |             |
| EVM+ compatibility          | Orbit supports EVM-compatible smart contract code, and with Stylus, it will also support C, C++, and Rust languages.                                        |                    |                   |             |
| Configurability             | Orbit chains can be customized to meet specific business, technical, and regulatory needs.                                                                  |                    |                   |             |
| Independence                | Developers can create their own product roadmap, independent of public blockchain roadmaps.                                                                 |                    |                   |             |
| Gas price reliability       | Orbit chains are isolated from traffic congestion on Arbitrum L2s, ensuring more reliable gas prices.                                                       |                    |                   |             |
| Fee tokens                  | Developers can choose a custom fee token for their Orbit chain.                                                                                             |                    |                   |             |
| Access to liquidity         | Orbit chains can access liquidity on Arbitrum One or Nova through fast bridging providers or other liquidity solutions.                                     |                    |                   |             |
| Scalability                 | Orbit chains offer the ability to customize gas speed limit and gas price floor, providing scalability while maintaining isolation from public blockchains. |                    |                   |             |
| Traffic isolation           | Orbit chains have traffic isolated from the main chain, ensuring smoother performance.                                                                      |                    |                   |             |
| Nitro upgrades              | As the Nitro Tech stack is updated, Orbit chains utilizing AnyTrust and Rollup technology will be upgraded.                                                 |                    |                   |             |
| Chain composability:        | L3-L3 communication is WIP, with L2-L3 communication possible through bridge providers and fast confirmations.                                              |                    |                   |             |
| Decentralization options    | Developers can allowlist validators and select a data availability committee for their Orbit chain.                                                         |                    |                   |             |
| Upfront costs               | Orbit chains have lower upfront setup costs for AnyTrust and Rollup compared to customizing the Nitro Tech stack.                                           |                    |                   |             |
| Security model              | Orbit chains maintain the same trust assumptions as Arbitrum One and Nova, unless the tech stack is customized.                                             |                    |                   |             |
| Regulatory compliance       | If L1/L2 solutions don't meet regulatory compliance needs, you can permission your Orbit chains to comply with regulatory requirements such as AML/KYC.     |                    |                   |             |


### What are some caveats and considerations that I should keep in mind as I evaluate Orbit for my project?

- **Licensing** (intent: provide information)
- **Scalability** (intent: highlight advantages)
- **Settlement and Execution** (intent: show customization options)
- **Trust Assumptions** (intent: compare security aspects)
- **Permissions** (intent: showcase flexibility)
- **Transaction Costs and Throughput** (intent: demonstrate performance benefits - caveat - may not be able to provide direction whether transaction costs will go up or down)
- **Ownership and Extensibility** (intent: underline control and adaptability)
- **Traffic Isolation and Gas Price Reliability** (intent: emphasize dedicated resources)
- **Setup and Ongoing Costs** (intent: discuss affordability)
- **Access to Liquidity and Chain Composability** (intent: explain connectivity)
- **Configurability and Decentralization** (intent: highlight customization)
- **Fee Token** (intent: mention customizability)
- **Roadmap**



### How are decisions about Orbit's product development (scope, roadmap, priority) made? Are they DAO decisions?

*// todo*



### Why should I choose Orbit over alternative solutions?

*// todo - comparison table highlighting most compelling contrasts*





### I'd love to tinker with Orbit! What should I do next?

- Visit the **Orbit Quickstart** to get started.
- Visit one of our **how-tos** for procedural guidance that walks you through specific tasks with your Orbit deployment:
    - todo
- Visit one of our **conceptual documents** for an educational introduction to Orbit's underlying technology:
    - todo





[^1]: See [Arbitrum DAO docs](https://docs.arbitrum.foundation/new-arb-chains) for more info on the Arbitrum DAO's role in governing L2s.
[^2]: A game developer may prioritize performance over decentralization while requiring an Ethereum-grade settlement layer. They'd probably select Arbitrum Nova over Arbitrum One because Arbitrum Nova's AnyTrust protocol introduces a small degree of democratically managed centralization that expedites the L2 chain's posting of transaction data back down to Ethereum's L1 chain, reducing time-to-finality. AnyTrust chains trade decentralization for performance, while Rollup chains (like One) maintain Ethereum-grade decentralization.