---
title: 'A gentle introduction to BOLD'
sidebar_label: 'A gentle introduction to BOLD'
description: 'An educational introduction that provides a high-level understanding of BOLD, a new dispute protocol to enable permissionless validation for Arbitrum chains.'
target_audience: 'Users and researchers who want to learn about our next-generation dispute protocol that enables permissionless validation'
---

# A gentle introduction: Bounded Liquidity Delay (BOLD) challenge protocol

import PublicPreviewBannerPartial from './partials/_bold-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

This introduction is for those who want to learn about BOLD: a new challenge protocol for optimistic rollups that can enable **permissionless validation for Arbitrum chains**. BOLD stands for Bounded Liuqidity Delay and is currently deployed on a public testnet for anyone to join and test how challenges will work.

BOLD will eventually replace the current fraud proof mechanism that powers Arbitrum chains today.

### In a nutshell:
- Arbitrum's current challenge protocol has working fraud proofs and is used to secure Arbitrum chains via the Nitro tech stack. This design is, however, weak against a category of attacks known as _delay attacks_ in which malicious entities can delay confirmations of correct results on Arbitrum indefinitely. The risk of delay attacks are the reason why Arbitrum One and Nova limit the validator roles to a [pernmissioned set of parties maintanied by the Arbitrum DAO](https://docs.arbitrum.foundation/state-of-progressive-decentralization#allowlisted-validators). Read more about what Delay Attacks are in the context of Rollups [here](https://medium.com/offchainlabs/solutions-to-delay-attacks-on-rollups-434f9d05a07a).
- Permissionless state validation is a critical milestone on [Arbitrum's progressive decentralization roadmap](https://docs.arbitrum.foundation/state-of-progressive-decentralization) to being a Stage 2 rollup and helps usher in a new era of resilient and robust technologies to help scale Ethereum.
- BOLD, an acronym for Bounded Liquidity Delay, is a new challenge protocol that aims to minimize the impact of delay attacks on rollups like Arbitrum with a **fixed, upper bound on state transition confirmations** while also allowing a **single, honest validator to win disputes against any number of adversaries - unlocking the potential for permissionless validation**. 
- The mechanism by which BOLD uses to enable these outcomes is by **tying the dispute with the deterministic execution of an L2 or L3 state**, rather than a particular staker or entity. This means that anyone who agrees with a state can defend it, until a single point of disagreement is found and the dishonest entity punished. By extension, this means that so long as there is a single honest party participating and agreeing with the deterministic L2 state, that **single honest party will always win disputes**.
- While this novel challenge protocol is still under active development and research, the BOLD protocol has been deployed on a public testnet. Anyone is welcome to deploy a BOLD validator to test and explore, first-hand, how BOLD works to secure rollups by following [this guide](TODO). The BOLD challenge protocol will soon secure Arbitrum One and Nova (pending a governance vote), along with all other Orbit chains when its development and testing concludes. To learn more, please checkout the [BOLD whitepaper](https://github.com/OffchainLabs/bold/blob/main/docs/research-specs/BOLDChallengeProtocol.pdf) and [BOLD's code and specifications on Github](https://github.com/OffchainLabs/bold).

### What is BOLD?


### How is this possible?

#### Architecture

### Why does this matter?


### What can I do?

### Wen mainnet?