# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General rules

- After each round of code changes, git commit one file at a time
- don't add claude code attribution to commit messages
- Always refactor README if the latest code changes impact the long term
- Always use docs-architect to refactor CLAUDE.md after making changes
- Always prompt before starting a round of files modifications
- If you need additional information to provide a valid answer, always ask me before providing a final output. DO NOT provide any output until you have gathered enough information from me

## Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

## Workflow

- Be sure to typecheck when you’re done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance

## Build Commands

- Install dependencies: `yarn`
- Start development server: `yarn start --no-open`
- Generate SDK documentation independently: `yarn generate-sdk-docs`
- Build site: `yarn build`
- Serve built site locally: `yarn serve --no-open`
- Format code: `yarn format`
- Run typecheck: `yarn typecheck`
- Install SDK dependencies: `yarn install-sdk-dependencies`
- Generate precompiles reference tables: `yarn generate-precompiles-ref-tables`

### SDK Documentation Generation

SDK documentation is automatically generated when you run `yarn start` or `yarn build` via the docusaurus-plugin-typedoc plugin. You can also generate SDK docs independently without starting the dev server using `yarn generate-sdk-docs`.

### Development Server Management

- **Always use --no-open flag**: When running Docusaurus commands like `yarn start`, always include the `--no-open` flag to prevent automatically opening the browser
- **Always shutdown Docusaurus after use**: After running `yarn start` or similar commands, always kill the process on port 3000 to free up the port for future use
- **Always verify implementations**: Before marking any implementation as complete, always run `yarn start --no-open` and inspect the output to ensure everything works correctly

## Git Workflow Best Practices

### General Guidelines

1. **Commit meaningful changes**: Make atomic commits with clear, descriptive messages
2. **Keep commits focused**: Each commit should represent a single logical change
3. **Test before committing**: Always verify your changes work locally before committing
4. **Follow conventional commits**: Use prefixes like `feat:`, `fix:`, `docs:`, `chore:` for commit messages
5. **Review before pushing**: Double-check your changes using `git diff` before pushing

### Working with Branches

- Create feature branches from the main branch for new work
- Keep branches up to date with regular merges or rebases from main
- Delete branches after they're merged to keep the repository clean
- Use descriptive branch names that indicate the purpose of changes

### Handling Large Files

- Never commit generated files or build artifacts
- Use `.gitignore` to exclude temporary files, node_modules, and build directories
- Be mindful of file sizes when adding new assets or documentation

### Troubleshooting Common Issues

- **Merge conflicts**: Resolve carefully, test thoroughly after resolution
- **Large push failures**: Break up changes into smaller commits if needed
- **Accidental commits**: Use `git reset` or `git revert` as appropriate

## Content Writing Guidelines

### Terminology Reference

When writing documentation, use these terminology standards:

| Term                   | Correct Usage                                                       | Incorrect Usage                              |
| ---------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| **JavaScript**         | JavaScript                                                          | js, javascript, Javascript                   |
| **Decentralized app**  | First mention: "decentralized app", Subsequent: "app"               | dapp, dApp                                   |
| **Rollup**             | Rollup (capital R)                                                  | rollup, roll up, roll-up                     |
| **Layer terminology**  | Parent chain (instead of Layer 1), Child chain (instead of Layer 2) | Layer-1, L1, layer 1<br>Layer-2, L2, layer 2 |
| **Geth**               | Geth (capital G)                                                    | geth                                         |
| **Oracle**             | oracle (lowercase)                                                  | Oracle                                       |
| **Transactions**       | transaction/transactions                                            | tx, txs                                      |
| **Data availability**  | First: "Data availability server (DAS)"<br>Then: "DAS"              | -                                            |
| **Smart contract**     | smart contract, contract                                            | smartcontract                                |
| **Cross-chain**        | cross-chain (hyphenated)                                            | cross chain, crosschain                      |
| **Networks**           | Arbitrum Goerli                                                     | Nitro Goerli, Rollup testnet                 |
| **ERC Standards**      | `ERC-XX` (e.g., `ERC-20`, `ERC-721`)                                | ERC20, erc721                                |
| **EIP Standards**      | `EIP-XXXX` (e.g., `EIP-1134`, `EIP-221`)                            | EIP1134, eip-221                             |
| **Inclusive language** | allowlist, denylist                                                 | whitelist, blacklist                         |
| **Sequencer Manager**  | Sequencer Coordination Manager (SQM)                                | sequencer coordinator manager                |
| **AnyTrust**           | AnyTrust                                                            | anytrust, Anytrust                           |
| **Ethereum currency**  | `ETH`, Ether/ether                                                  | eth, Eth, ETH                                |
| **Onchain**            | onchain                                                             | on-chain, on chain                           |
| **Arbitrum chains**    | Your Arbitrum chain                                                 | Avoid "L3 Orbit chain" or "blockchain"       |
| **Challenge period**   | 6.4 days to challenge an assertion                                  | Distinguished from confirmation period       |
| **Bond**               | Bonded funds for proposing                                          | Preferred over "stake"                       |

### Writing Style Principles

| Principle                     | Description                                       | Good Example                      | Avoid                                     |
| ----------------------------- | ------------------------------------------------- | --------------------------------- | ----------------------------------------- |
| **Use sentence case**         | First letter capitalized, rest lowercase          | "Deploy your smart contract"      | "Deploy Your Smart Contract"              |
| **Write descriptive links**   | Links describe their destination                  | "See our [deployment tutorial]"   | "Find more [here]"                        |
| **Minimize technical jargon** | Use plain language when possible                  | "How to reuse contract methods"   | "How to leverage trait-based composition" |
| **Lead with what matters**    | Put important information first                   | Start with the outcome or benefit | Bury the key point                        |
| **Write concisely**           | Use short, clear sentences                        | Break up complex ideas            | Write three-line sentences                |
| **Be conversational**         | Write as if speaking to a smart friend in a hurry | Use natural contractions          | Overly formal language                    |
| **Set clear expectations**    | State purpose and prerequisites upfront           | "This guide shows you how to..."  | Unclear objectives                        |
| **Cut unnecessary content**   | When in doubt, remove it                          | Brief, accessible text            | Verbose explanations                      |
| **Use American English**      | Consistent spelling and grammar                   | "color", "optimize"               | "colour", "optimise"                      |

#### Additional Writing Guidelines

- Maintain separation between procedural and conceptual content – include only necessary concepts in how-tos
- Target specific audience personas with clearly defined needs and goals
- Define technical jargon when necessary, especially on first mention
- Spell out words like "and" or "or" rather than using symbols ("&" or "/")
- Prioritize accessible accuracy over technical precision when extreme precision isn't required
- Tag code blocks in bash script with `shell and not `bash

### Content Types

Choose the appropriate content type based on user needs:

- **Gentle Introduction**: Day 1 onboarding for newcomers when multiple audiences need foundational knowledge
- **Quickstart**: Fast onboarding with hands-on steps when single audience needs immediate activation
- **How-to**: Step-by-step task completion when users need to accomplish a specific task
- **Tutorial**: Comprehensive learning experience when users need to learn through guided practice
- **Concept**: Explain ideas and relationships when users need to understand how something works
- **Reference**: Quick lookup of technical details when users need specific technical information
- **Troubleshooting**: Problem-solution mapping when users are encountering specific issues

### Document Structure

Every document must include frontmatter:

```yaml
---
title: 'Document title (appears as H1)'
sidebar_label: 'Shortened title for sidebar'
description: 'SEO-friendly description'
user_story: 'As a <role>, I want to <goal>'
content_type: 'how-to, concept, etc.'
author: '<github-username>'
sme: '<github-username>'
---
```

## Quick Reference Tables

### Common Terminology Checklist

Quick reference for the most frequently used terms:

| ✅ Use This             | ❌ Not This         |
| ----------------------- | ------------------- |
| JavaScript              | js, Javascript      |
| decentralized app → app | dapp, dApp          |
| Parent/Child chain      | L1/L2, Layer 1/2    |
| smart contract          | smartcontract       |
| cross-chain             | crosschain          |
| onchain                 | on-chain            |
| `ERC-20`, `ERC-721`     | ERC20, ERC721       |
| allowlist/denylist      | whitelist/blacklist |

### Writing Style Checklist

| ✅ Do This             | ❌ Don't Do This        |
| ---------------------- | ----------------------- |
| Sentence case headers  | Title Case Headers      |
| Descriptive link text  | Click "here" links      |
| Address with "you"     | Third person references |
| Short, clear sentences | Long, complex sentences |
| Lead with benefits     | Bury the main point     |
| Use contractions       | Overly formal tone      |
| American English       | British English         |
