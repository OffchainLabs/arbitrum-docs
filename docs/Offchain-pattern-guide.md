---
title: 'Offchain Pattern guide'
description: 'Offchain Pattern guide'
author: anegg0
user_story: As an Offchain content contributor, I want to ensure my write-up complies with Offchain standards
content_type: reference
---

This document provides guidance on how to write a document that complies with Offchain's editorial standards

## Content types

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

## Writing principles

| Principle                     | Description                                               | Good Example                                                                                                                                                     | Avoid                                                                                                 |
| ----------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Use American English**      | Use American english spelling and syntax                  | "Choose the right color"                                                                                                                                         | "Choose the right colour"                                                                             |
| **Use sentence case**         | First letter capitalized, rest lowercase                  | "Deploy your smart contract"                                                                                                                                     | "Deploy Your Smart Contract"                                                                          |
| **Write descriptive links**   | Links describe their destination                          | "See our [deployment tutorial]"                                                                                                                                  | "Find more [here]"                                                                                    |
| **Minimize technical jargon** | Use plain language when possible                          | "How to reuse contract methods"                                                                                                                                  | "How to leverage trait-based composition"                                                             |
| **Lead with what matters**    | Put important information first                           | Start with the outcome or benefit                                                                                                                                | Bury the key point                                                                                    |
| **Write concisely**           | Use short, clear sentences                                | Break up complex ideas                                                                                                                                           | Write three-line sentences                                                                            |
| Use Quicklooks                | Use Quicklooks with terms found in docs/partials/glossary | In the past, Arbitrum chains ordered incoming transactions on a <a data-quicklook-from='first-come-first-serve-fcfs'>"First-Come, First-Serve (FCFS)"</a> basis. | In the past, Arbitrum chains ordered incoming transactions on "First-Come, First-Serve (FCFS)" basis. |

## Plain language

Plain language means the reader finds what they need, understands it the first time, and can act on it. This section applies the ISO 24495-1 principles through the concrete rules of the [Federal Plain Language Guidelines](https://www.plainlanguage.gov/guidelines/), plus two rules borrowed from ASD-STE100 Simplified Technical English.

Every rule below is testable in review.

### Sentence-level rules

| Rule                                    | Correct                                                                        | Incorrect                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Address the reader as "you"**         | "You must fund the batch poster account."                                      | "Users must ensure their batch poster account is funded."        |
| **Use active voice and name the actor** | "The batch poster compresses transactions and posts them to the parent chain." | "Transactions are compressed and posted to the parent chain."    |
| **Use present tense**                   | "The sequencer orders incoming transactions."                                  | "The sequencer will order incoming transactions."                |
| **One idea per sentence**               | Two sentences of about 15 words each.                                          | One sentence of 40 words with three clauses.                     |
| **Use verbs, not nominalizations**      | "Configure the sequencer."                                                     | "Perform configuration of the sequencer."                        |
| **Put the condition before the action** | "If you run an AnyTrust chain, enable the DA server."                          | "Enable the DA server if you run an AnyTrust chain."             |
| **Use the imperative for steps**        | "Run `yarn build`."                                                            | "You should now proceed to run `yarn build`."                    |
| **State things positively**             | "Wait until the assertion is confirmed."                                       | "Do not continue before the assertion is no longer unconfirmed." |
| **Give concrete numbers**               | "The challenge period is 6.4 days."                                            | "The challenge period takes a while."                            |
| **Reserve must, should, and can**       | must = required, should = recommended, can = optional                          | "should" for a step the reader has no choice about               |

### One term, one meaning

Pick one name for each concept and use it for the whole page. Alternating between synonyms makes the reader ask whether you mean two different things.

| Concept                            | Pick one and keep it | Don't mix on one page                   |
| ---------------------------------- | -------------------- | --------------------------------------- |
| The chain your app runs on         | child chain          | L2, child chain, Arbitrum chain, rollup |
| The node that orders transactions  | sequencer            | sequencer, sequencing node, the orderer |
| The party that proposes assertions | proposer             | proposer, staker, validator             |

Expand every acronym on first use. Wrap that first mention in a Quicklook when a glossary partial exists for the term.

### Words to replace

| Don't write             | Write                           |
| ----------------------- | ------------------------------- |
| utilize, leverage       | use                             |
| in order to             | to                              |
| prior to, subsequent to | before, after                   |
| facilitate              | help                            |
| terminate               | end                             |
| sufficient              | enough                          |
| additional              | more                            |
| approximately           | about                           |
| commence, initiate      | start                           |
| in the event that       | if                              |
| at this point in time   | now                             |
| e.g., i.e., etc.        | for example, that is, and so on |

### Phrases to cut

Delete these openers and keep the sentence that follows: "It is important to note that", "Please note that", "As previously mentioned", "In the context of", "It should be pointed out that".

Never write "simply", "just", "easy", "obvious", or "of course". When the step does not work, these words tell the reader the fault is theirs.

### Paragraph and page rules

- One topic per paragraph, five lines at most.
- Convert any sentence with three or more conditions into a bulleted list or a table.
- Lead each section with the outcome, then the detail.
- Write headings a reader can scan to find their task.

### Authoring conventions

- Use `<VanillaAdmonition type="…">` instead of Docusaurus `:::info` / `:::note` for callouts in MDX. The component is registered globally via `src/theme/MDXComponents.js`, so no import is needed.
- Wrap a term in a Quicklook (`<a data-quicklook-from='…'>`) once per file, on its first mention. Leave every later mention of that same term as plain text. A second Quicklook on the same term tells the reader nothing new and turns the page into a field of links.

## Terminology guide

| Term                           | Correct                                                                  | Incorrect                              |
| ------------------------------ | ------------------------------------------------------------------------ | -------------------------------------- |
| JavaScript                     | JavaScript                                                               | js, javascript, Javascript             |
| app                            | first mention on page → decentralized app<br />subsequent mentions → app | dapp, dApp                             |
| Smart contract                 | smart contract, contract                                                 | smartcontract                          |
| Cross-chain                    | cross-chain                                                              | cross chain, crosschain                |
| Allowlist/Denylist             | allowlist, denylist                                                      | whitelist, blacklist                   |
| ERC-XX (ERC-20, ERC-721, …)    | ERC-20, ERC-721, ERC-1155                                                | ERC20, erc721, …                       |
| Sequencer Coordination Manager | Sequencer Coordination Manager (SQM)                                     | sequencer coordinator manager          |
| AnyTrust                       | AnyTrust                                                                 | anytrust, Anytrust                     |
| Ethereum currency              | ETH, Ether, ether                                                        | eth, Eth, `ETH`                        |
| onchain                        | onchain                                                                  | on-chain, on chain                     |
| Arbitrum chains                | "Your Arbitrum chain"                                                    | "L3 Orbit chain", "blockchain"         |
| Challenge period               | 6.4 days to challenge an assertion                                       | confirmation period (a different term) |
| Bond                           | bond, bonded funds for proposing                                         | stake, staked funds                    |
| Rollup                         | Rollup                                                                   | rollup                                 |

## Diagrams and visual content

### Preferred format

- Use SVG for scalability and code-friendliness
- Avoid PNG unless necessary

### Recommended tools

- excalidraw for creating diagrams
- Focus on illustrating concepts, data structures, and flows
- **Third-party content guide** - if you’re not sure how to incorporate third-party content and tooling into our docs
  - See [https://docs.arbitrum.io/for-devs/contribute](https://docs.arbitrum.io/for-devs/contribute)
