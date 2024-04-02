---
title: 'A gentle introduction: BOLD'
sidebar_label: 'A gentle introduction'
description: 'An educational introduction that provides a high-level understanding of BOLD, a new dispute protocol to enable permissionless validation for Arbitrum chains.'
user_story: 'As a user or researcher of the Arbitrum product suite, I want to learn about BOLD, a next-generation dispute protocol that enables permissionless validation.'
content_type: gentle-introduction
author: leeederek
sme: leeederek
---

import PublicPreviewBannerPartial from './partials/_bold-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

This introduction is for those who want to learn about BOLD: a new dispute protocol for Optimistic Rollups that can enable **permissionless validation for Arbitrum chains**. BOLD stands for Bounded Liquidity Delay and is currently deployed on a public testnet for anyone to join and test how challenges will work. 

This next-generation dispute protocol technology will soon be available for any Arbitrum chain, and pending a governance vote, will eventually be made available on Arbitrum Sepolia, Arbitrum One, and Arbitrum Nova.

BOLD will eventually replace the current, permissioned fraud proof mechanism that powers Arbitrum chains today.

## In a nutshell:

- BOLD, an acronym for Bounded Liquidity Delay, is a new challenge protocol for Arbitrum chains that ensures disputes will take, at most, 1 challenge period (6.4 days) to get resolved. BOLD effectively eliminates delay attacks by enforcing a upper time-bound for dispute resolution.
- Validation for Arbitrum One and Nova is currently is limited to a [permissioned set of parties maintained by the Arbitrum DAO](https://docs.arbitrum.foundation/state-of-progressive-decentralization#allowlisted-validators) to reduce the risks of *[delay attacks](https://medium.com/offchainlabs/solutions-to-delay-attacks-on-rollups-434f9d05a07a)* where malicious entities can indefinitely open disputes and delay confirmations of assertions about Arbitrum states.
- However, BOLD mitigates the risks for delay attacks and therefore paves the way for permissionless validation of Arbitrum chains. Permissionless validation is a key milestone on [Arbitrum’s journey to becoming a Stage 2 Rollup](https://docs.arbitrum.foundation/state-of-progressive-decentralization) - the most advanced and mature rollup technology categorization. With BOLD, **any honest party can stake on the correct L2 state and will always win disputes against malicious entities.**
- BOLD is currently considered to be in `alpha` release and is deployed on a public testnet. [Follow this guide](https://github.com/OffchainLabs/bold-validator-starter-kit) to deploy a BOLD validator to test & explore, first hand, how BOLD works to secure Arbitrum chains. To learn more about BOLD, please check out the [BOLD whitepaper](https://github.com/OffchainLabs/bold/blob/main/docs/research-specs/BOLDChallengeProtocol.pdf) and [BOLD's code and specifications on Github](https://github.com/OffchainLabs/bold).

## What _exactly_ is BOLD?
BOLD, an acronym for Bounded Liquidity Delay Protocol, is a set of rules used by validators to open and resolve disputes about Arbitrum’s state to ensure only valid states get confirmed to an Arbitrum chain’s data availability layer, such as Ethereum, for example. BOLD is shipped as part of the Nitro tech stack - the software that powers every Arbitrum validator node. 

In short, BOLD secures the process of withdrawing assets from Arbitrum back to Ethereum.

A BOLD-enabled validator’s responsibilities are to:

- Post claims about an Arbitrum chain’s state to Ethereum,
- Challenge invalid claims made by other validators, and
- Confirm valid claims - either by timing other validators out or by winning a challenge

The goal of BOLD is ensure the maximum challenge period is 6.4 days, effectively removing the risk of delay attacks and making L2 to L1 withdrawals more secure. BOLD accomplishes this by introducing a new dispute system that lets a single entity secure Arbitrum against malicious parties - effectively allowing anyone to validate Arbitrum’s state without needing permission to do so.


## Why does Arbitrum need a new dispute protocol?

While Arbitrum chains today have working fraud proofs to secure withdrawals, BOLD introduces a few subtle but innovative changes that let *anyone* challenge and win disputes - all within a fixed time period. In other words, Arbitrum chains will continue to be secured with an interactive proving game between validators, but with the added benefit of this game being completely permissionless and time-bounded to 1 challenge period (currently set at 6.4 days).

Under the hood, the reason why BOLD can offer time-bound, permissionless validation is because a correct Arbitrum state assertion is **not tied to a single staker or entity**. Instead, because L2 states are completely deterministic and can eventually be proven on Ethereum, any party can stake on this correct, deterministic state and, through interactive fraud proofs, can prove that their claim is correct. This means that a single honest party staking on the correct state assertion will always win, guaranteed. 

To summarize with an analogy and the diagram below: Arbitrum’s current dispute protocol assumes that any assertion that gets challenged must be defended against each unique challenger sequentially, like in a *“1v1 tournament”*. BOLD, on the other hand, enables any single honest party to defend the correct state and be guaranteed to win, similar to an *“all-vs-all battle royale”* where there must and will always be a single winner in the end.

![before-and-after-with-bold](./assets/before-vs-after-with-bold.png)
*Note that the timer/clocks above are arbitrary and instead represent the duration of challenges and how challenges are sequential today but can take place in parallel with BOLD. The duration of challenges are independent from one another.*

### BOLD makes withdrawals to L1 Ethereum safer
Today, the rollup protocol for Arbitrum chains works by posting both transaction data & the resulting state from those transactions to a data availability layer, like Ethereum. Then, there is a period of time called the “challenge period” where any validator can open a dispute on a given state - this is what makes Arbitrum an optimistic rollup. This challenge period is why you must wait ~1 week (6.4 days to be exact) to withdraw assets from Arbitrum One, for example. 

While this is quite secure, this design is susceptible to [delay attacks](https://medium.com/offchainlabs/solutions-to-delay-attacks-on-rollups-434f9d05a07a), where malicious actors continuously open disputes to extend that challenge period for as long as they’re willing to sacrifice stakes - effectively extending the challenge period indefinitely. This risk is not ideal nor safe and is why validation for Arbitrum One and Nova is confined to a permissioned set of entities overseen by the Arbitrum DAO.

![bold-safer-withdrawals](./assets/safer-withdrawals-with-bold.png)

BOLD addresses these challenges head-on by introducing a time limit on the existing rollup protocol for resolving disputes, effectively ensuring that challenges conclude within a 7-day window (this window can be decreased by the DAO). This is possible due to two reasons: (1) BOLD’s design allows for challenges between the honest party and any number of malicious adversaries to happen in parallel, and (2) the use of a time limit that will automatically confirm the honest party’s claims if the challenger fails to respond.

### BOLD brings Arbitrum closer to being recognized as a Stage 2 rollup

Inspired by [Vitalik’s proposed milestones](https://ethereum-magicians.org/t/proposed-milestones-for-rollups-taking-off-training-wheels/11571), the team over at L2Beat has assembled a widely recognized framework for evaluating the development Ethereum Rollups. Both Vitalik and the [L2Beat framework](https://medium.com/l2beat/introducing-stages-a-framework-to-evaluate-rollups-maturity-d290bb22befe) refer to the the final stage of rollup development as *“Stage 2 - No Training Wheels”*. A critical criterion for being considered a Stage 2 rollup is to allow anyone to validate the L2 state and post fraud proofs to Ethereum without restraints. This is considered a key requirement for Stage 2 because it ensures *[“that the system is not controlled by a limited set of entities and instead is subject to the collective scrutiny of the entire community”](https://medium.com/l2beat/introducing-stages-a-framework-to-evaluate-rollups-maturity-d290bb22befe).* 

BOLD enables permissionless validation by allowing *anyone* to challenge incorrect Arbitrum state assertions and therefore unlocks new avenues for participation in securing the network, fostering greater inclusivity and resilience. This is made possible because BOLD guarantees that a single, honest entity staked on the correct Arbitrum state assertion will always win against malicious adversaries. The research and work to bring BOLD to life underscores Arbitrum's commitment to scaling Ethereum without compromising on security. 

![pie-slice](./assets/l2beat-pie-chart.png)

With BOLD at its core, Arbitrum charts a course towards being recognized as a Stage 2 rollup by addressing the currently yellow (above) State Validation wedge in [L2Beat's risk analysis pie chart](https://l2beat.com/scaling/summary). BOLD contributes to a more decentralized, efficient, and robust rollup ecosystem. Additionally, BOLD will be available as an upgrade to all Orbit chains who wish to adopt it to reap the aforementioned benefits.

### How is this possible?
The BOLD protocol provides the guardrails and rules for how validators produce, validate, and challenge claims about the state of an Arbitrum chain. Since Arbitrum’s state is deterministic, there will always be only 1 correct state for a given input of on-chain operations and transactions. The beauty of BOLD’s design is centered around this very fact: that there is only 1 correct state on Arbitrum and therefore anyone defending that correct state will always prevail.

Let’s dive in to an overview of how BOLD actually works.

1. **An assertion is made:** Validators begin by taking the most recent confirmed L2 block, called `Block A`, and assert that some number of transactions afterwards, using Nitro’s deterministic State Transition Function (STF), will result in an end state, `Block Z`. If a validator claims that the end state represented by `Block Z` is correct, they will stake on `Block Z` and propose that state to be posted to Ethereum. If nobody disagrees after a certain amount of time, known as the challenge period, then the state represented by the L2 `Block Z` is confirmed as the correct state of an Arbitrum chain. However, if someone disagrees with the end state `Block Z`, they can submit a challenge. This is where BOLD comes in to play.
2. **A challenge is opened:** When another validator observes and disagrees with the end state represented by `Block Z`, they can permissionlessly open a challenge by asserting and staking a claim on a different end state, represented by an L2 `Block Y`. At this point in time, there are now 2 asserted states: `Block A → Block Z` and `Block A → Block Y`. This pair of asserted states is called *an edge* while a Merkle tree of asserted states from some start to end point (e.g. `Block A → Block Z`) is more formally known as a *history commitment.* It is important to note that Ethereum at this point in time has no notion of which edges are correct or incorrect - edges are simply a portion of a claim about the history of the chain from some end state all the way back to some initial state.
3. **Multi-level, interactive dissection begins:** To resolve the dispute, the disagreeing entities will need to come to an agreement on what the *actual, correct* asserted state should be. [It would be tremendously expensive to re-execute](https://docs.arbitrum.io/inside-arbitrum-nitro/#why-interactive-proving-is-better) and compare everything from `Block A → Block Z` and `Block A → Block Y`, especially since there could be potentially millions of transactions in between `A`, `Z`, and `Y`. Instead, entities take turns bisecting their respective *history commitments* until they arrive at a single step of instruction where an arbiter, like Ethereum, can declare a winner. Note that [this system is very similar to how challenges are resolved on Arbitrum chains today](https://docs.arbitrum.io/inside-arbitrum-nitro/#challenges) - BOLD only changes some minor, but important, details in the resolution process. Let’s dive into what happens next:
    1. **Block challenges**: when a challenge is opened, the edge is called a *level-zero edge* since it is at the granularity of Arbitrum blocks. The disputing parties take turns bisecting their history commitments until they identify the specific block that they disagree on. 
    2. **Big-step challenges:** now that the parties have narrowed down their dispute to a single block, that we call `Block B`, the back-and-forth bisection exercise continues within that block. Note that `Block B` is claimed by all parties to be some state after the initial state `Block A` but before the final states `Block Z` and `Block Y`. This time however, the parties will narrow down on a specific *range* of instructions for the state transition function within the block - essentially working towards identifying a set of instructions that their disagreement lies within. This range is currently defined to be 2^20 steps of WASM instructions, which is the assembly of choice for validating Arbitrum chains.
    3. **One-step challenge:** within that range of 2^20 instructions, the back and forth bisecting continues until all parties arrive at a single step of instruction that they disagree on. At this point in time, parties agree on the initial state of Arbitrum before the step but disagree on the end state 1 step immediately after. Remember that since Arbitrum’s state is entirely deterministic, there is only 1 correct end state.
4. **One-step proof:** Once a challenge is isolated to a dispute about a single step, the honest party's edge can be proven correct with a *one-step proof*. A one-step proof is, in theory, a proof that a single step of computation results in a particular state. The honest party will submit such a proof, whose correctness is easily and quickly validated via execution on Ethereum. The honest edge will thus be confirmed, and the dishonest one rejected.
5. **Confirmation:** Once the honest one-step edge is confirmed, the protocol will work on confirming or rejecting the parent edges until it reaches the level-zero edge of the honest party. With the honest party’s level-zero edge now confirmed, the honest party’s stake and gas are refunded. Meanwhile, the dishonest party has their stake taken away to ensure the dishonest party is always punished.
    1. There is another way that a level-zero edge can get confirmed: time. At each of the mini-stages of challenge (block challenge, big-step challenge, one-step challenge), there is a timer that increments upwards towards some challenge period, *T* defined by BOLD. This timer begins ticking for a party when they submit their bisected history commitment until their challenger submits their bisected history commitment in response. An edge is automatically confirmed if the timer reaches *T.* 

That’s it! We’ve now walked through each of the steps that validators will take to dispute challenges with the BOLD protocol. One final note here is that each of the steps explained above can take place concurrently and this is one of the reasons why BOLD can guarantee that disputes are resolved within a fixed time frame.

## What can I do with BOLD today?
Today, BOLD is deployed on a public testnet using Ethereum Sepolia as a base layer for anyone to experiment with and test on. The intent behind this is purely to demonstrate, first-hand, how disputes can effectively resolved by a single party in a fixed challenge period on Arbitrum chains. Feedback gained from developers, users, and researchers will help improve and strengthen BOLD’s design. 

If you’re intrigued by what BOLD can unlock for Arbitrum chains, we encourage you to interact with BOLD by:
* [Following this guide](https://github.com/OffchainLabs/bold-validator-starter-kit) to deploy a BOLD validator to test & explore, first hand, how BOLD works to secure Arbitrum chains.
* Checking out the [BOLD testnet status page](https://status-bold.vercel.app/) where you can observe the state of the testnet, including on-going challenges & various statistics.
* Reading the [BOLD whitepaper](https://github.com/OffchainLabs/bold/blob/main/docs/research-specs/BOLDChallengeProtocol.pdf) and [BOLD's code and specifications on Github](https://github.com/OffchainLabs/bold) to understand how BOLD works under the hood.

## Wen mainnet?
BOLD is in `alpha`, which means there are a lot of planned improvements on the roadmap. A few high-level next steps for BOLD's journey to being deployed to Arbitrum chains include:
- A comprehensive, third-party audit of the [BOLD source code](https://github.com/OffchainLabs/bold) to ensure the effectiveness and safety of the design.
- Tools and frameworks for the smooth migration of existing validators and a seamless on-boarding for new validators to use BOLD for their respective Arbitrum chains.
- Monitoring stack for people to use to see on-going challenges on the testnet
- A mechanism for the community to pool funds together to stake on assertions made by validators
- The launch of a public bounty program for white hat auditors and security professionals to help test and secure the BOLD protocol design.
- Proposing, to the Arbitrum DAO, that the BOLD protocol be adopted - first for Arbitrum Sepolia and then eventually for Arbitrum One and Arbitrum Nova.
- Cutting a GA release of Nitro that enables BOLD validation.

## Frequently asked questions about BOLD (FAQ):

**How does staking work?**

- Like how Nitro works today, a stake of monetary value is required for a BOLD-enabled validator to make an on-chain assertion about the chain's latest state. It follows, then, that this stake is required to post rival assertions against invalid assertions (i.e. open a challenge) to defend an Arbitrum chain. This stake can be any ERC20 token and should be set to a large enough value (e.g. 100 ETH) to make it economically infeasible for an advesary to attack an Arbitrum chain and to mitigate against spam (that would otherwise delay confirmations up to, but not exceeding, 1 challenge period). Setting such a high value, however, means that the cost for an honest party to defend Arbitrum is proportional to the number of malicious entities and on-going challenges at any given point in time. To address this, there is a [contract](https://github.com/OffchainLabs/bold/blob/main/contracts/src/assertionStakingPool/AssertionStakingPoolCreator.sol) that anyone can use to deploy a staking pool as a way of crowdsourcing funds from others who wish to help defend Arbitrum but who may not individually be able to put up the large upfront stake itself.

**What is the user flow for using the assertion staking pool contract?**

- Anyone can deploy an assertion staking pool using this [`AssertionStakingPoolCreator.sol`]([contract](https://github.com/OffchainLabs/bold/blob/main/contracts/src/assertionStakingPool/AssertionStakingPoolCreator.sol)) as a means to crowdsource funds for staking on an assertion. To defend Arbitrum using a staking pool, an entity would first deploy this pool with the assertion that they believe is correct and wish to stake on to challenge an advesary's assertion. Then, anyone can verify that the claimed assertion is correct by running the inputs through their node's State Transition Function (STF). If other parties agree on the assertion being correct, then they can deposit their funds into the contract. When enough funds have been deposited, anyone can permissionlessly trigger the creation of the assertion on-chain to start the challenge. Finally, once the honest parties' assertion is confirmed by the dispute protocol, all involved entities will get their funds reimbursed and can withdraw.

**Are there any incentives to run a BOLD validator to secure Arbitrum chains?**

- Running a BOLD validator secures their respective Arbitrum chain and protects the assets on the chain from malicious actors - all you need is 1 honest party. Other than this critical piece, there are currently no financial incentives for parties to run a BOLD validator. Any future decisions or changes to this design can be proposed to and voted on by the Arbitrum DAO.

**What type of hardware will be necessary to run a BOLD validator?**

- The type of hardware required for running a BOLD validator is still being researched and finalized. The goal, however, is that regular consumer hardware (i.e. laptop) can effectively be used by an honest party to secure an Arbitrum chain using BOLD in the average case.

**Is it possible that a high volume of disputes overwhelms the honest party?**

- Yes - while BOLD is specifically designed to manage and resolve concurrent challenges between any number of parties, there is a chance that the high volume of challenges going on at the same time overwhelms the honest party. To mitigate this risk, the cost of opening a challenge will scale with the number of open challenges so as to make it unfeasible for a malicious party to perform a DoS attack on an Arbitrum chain, and well-resourced honest parties will be able to respond to this number of malicious claims.

**How do BOLD validators communicate with one another? Is it over a P2P network?**

- BOLD validators for Arbitrum chains communicate directly with smart contracts on L1 Ethereum. This means that opening challenges, submitting bisected history commitments, one-step proofs, and confirmations are all refereed by Ethereum. There is no p2p between validators.

**For an L3 Orbit chain, secured using BOLD, that settles to Arbitrum One, does the one-step proof happen on Arbitrum One?**

- Yes

**Does implementing BOLD reduce the scope or remove the need for the Arbitrum Security Council?**

- BOLD can limit the scope of Arbitrum One and Nova’s reliance on the Security Council as it takes Arbitrum chains one-step closer to full decentralization.
