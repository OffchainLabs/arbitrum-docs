# Pattern guide - Docs

Last edited time: October 17, 2025 10:39 AM

This document provides guidance on how to write a document that complies with OCL editorial standards

---

### 2.1 Content Types

Choose the right content type based on your audience and purpose:

| Content Type            | Purpose                             | When to Use                                    | Example                                                                                            |
| ----------------------- | ----------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Gentle Introduction** | Day 1 onboarding for newcomers      | Multiple audiences need foundational knowledge | [Arbitrum Intro](https://developer.arbitrum.io/intro/)                                             |
| **Quickstart**          | Fast onboarding with hands-on steps | Single audience needs immediate activation     | [Solidity Quickstart](https://docs.arbitrum.io/build-decentralized-apps/quickstart-solidity-remix) |
| **How-to**              | Step-by-step task completion        | Users need to accomplish a specific task       | [Running an Archive Node](https://developer.arbitrum.io/node-running/running-an-archive-node)      |
| **Tutorial**            | Comprehensive learning experience   | Users need to learn through guided practice    | Integration guides                                                                                 |
| **Concept**             | Explain ideas and relationships     | Users need to understand how something works   | [Security Council](https://docs.arbitrum.foundation/concepts/security-council)                     |
| **Reference**           | Quick lookup of technical details   | Users need specific technical information      | API documentation                                                                                  |
| **Troubleshooting**     | Problem-solution mapping            | Users are encountering specific issues         | [Node Troubleshooting](https://developer.arbitrum.io/node-running/troubleshooting-running-nodes)   |
|                         |                                     |                                                |                                                                                                    |

### 2.2 Writing Principles

| Principle                     | Description                                               | Good Example                                                                                                                                                     | Avoid                                                                                                 |
| ----------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Use sentence case**         | First letter capitalized, rest lowercase                  | "Deploy your smart contract"                                                                                                                                     | "Deploy Your Smart Contract"                                                                          |
| **Write descriptive links**   | Links describe their destination                          | "See our [deployment tutorial]"                                                                                                                                  | "Find more [here]"                                                                                    |
| **Minimize technical jargon** | Use plain language when possible                          | "How to reuse contract methods"                                                                                                                                  | "How to leverage trait-based composition"                                                             |
| **Lead with what matters**    | Put important information first                           | Start with the outcome or benefit                                                                                                                                | Bury the key point                                                                                    |
| **Write concisely**           | Use short, clear sentences                                | Break up complex ideas                                                                                                                                           | Write three-line sentences                                                                            |
| Use Quicklooks                | Use Quicklooks with terms found in docs/partials/glossary | In the past, Arbitrum chains ordered incoming transactions on a <a data-quicklook-from='first-come-first-serve-fcfs'>"First-Come, First-Serve (FCFS)"</a> basis. | In the past, Arbitrum chains ordered incoming transactions on "First-Come, First-Serve (FCFS)" basis. |

### 2.3 Terminology Guide

| Term       | Correct                                   | Incorrect                  |
| ---------- | ----------------------------------------- | -------------------------- |
| JavaScript | JavaScript                                | js, javascript, Javascript |
| app        | first mention on page → decentralized app |

subsequent mentions → app | dapp, dApp |
| Smart contract | smart contract, contract | smartcontract |
| Cross-chain | cross-chain | cross chain, crosschain |
| Allowlist/Denylist | allowlist, denylist | whitelist, blacklist |
| ERC-XX
(ERC-20, ERC-721, …) | ERC-20, ERC-721, ERC-1155 | ERC20, erc721, … |
| Sequencer Coordination Manager | Sequencer Coordination Manager (SQM) | sequencer coordinator manager |
| AnyTrust | AnyTrust | anytrust, Anytrust |
| Ethereum currency | ETH, Ether, ether | eth, Eth, `ETH` |
| onchain | onchain | on-chain, on chain |
| Arbitrum chains | "Your Arbitrum chain" | Avoid "L3 Orbit chain" or "blockchain" |
| Challenge period | 6.4 days to challenge an assertion | Distinguished from confirmation period |
| Bond | Bonded funds for proposing | Preferred over "stake" |
| Rollup | Rollup | rollup |
| allowlist | allowlist | whitelist |
| denylist | denylist | blacklist |

### 6.3 Diagrams and Visual Content

### Preferred Format

- Use SVG for scalability and code-friendliness
- Avoid PNG unless necessary

### Recommended Tools

- excalidraw for creating diagrams
- Focus on illustrating concepts, data structures, and flows
- **Third-party content guide** - if you’re not sure how to incorporate third-party content and tooling into our docs
  - See [https://docs.arbitrum.io/for-devs/contribute](https://docs.arbitrum.io/for-devs/contribute)
