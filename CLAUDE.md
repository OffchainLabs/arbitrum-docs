# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- Install dependencies: `yarn`
- Start development server (fast, no SDK doc generation): `yarn start`
- Start development server with SDK doc generation: `yarn start:with-docs`
- Generate SDK documentation independently: `yarn generate-sdk-docs`
- Build site: `yarn build`
- Serve built site locally: `yarn serve`
- Format code: `yarn format`
- Run typecheck: `yarn typecheck`
- Install SDK dependencies: `yarn install-sdk-dependencies`
- Generate precompiles reference tables: `yarn generate-precompiles-ref-tables`

### Generated Documentation

The generated docs in `docs/sdk/` and `docs/stylus-by-example/` are **NOT committed to the repository** and are generated dynamically. These directories are listed in `.gitignore` and should never be tracked in Git.

**For all contributors:**
- Use `yarn start` for fast development (no SDK doc generation needed for most tasks)
- Use `yarn start:with-docs` if you need to work with SDK documentation locally
- Use `yarn generate-sdk-docs` to generate SDK docs independently when needed
- **NEVER commit generated files** - they will be built during deployment

**Development workflows:**
- `yarn start` - Quick start without generating docs (fastest for content editing)
- `yarn start:with-docs` - Start with SDK doc generation (when working on SDK-related content)
- `yarn start:fresh` - Regenerate all docs and start the dev server
- `yarn generate-docs` - Generate all docs without starting the dev server
- `yarn generate-sdk-docs` - Generate only SDK docs

**Production builds:**
- `yarn build` always generates fresh documentation for deployment
- CI/CD pipelines will generate all necessary documentation during the build process

## Style Guidelines

- Use Prettier for formatting with the config in `.prettierrc.js`
- Follow Docusaurus conventions for MDX/Markdown files
- Write sentence-case for content labels (titles, headers, menu items)
- Use descriptive link text rather than "here" or "this"
- Balance brevity with precision in titles
- Address readers as "you" with a conversational tone
- Target specific reader personas rather than general audiences
- Organize documents by type (gentle intro, quickstart, how-to, etc.)
- Minimize jargon and use clear, translation-friendly language
- Document types include: MDX files, TypeScript (React components), and scripts

## Content Writing System Prompts

### Terminology Reference

When writing documentation, use these terminology standards:

- JavaScript: Always "JavaScript" (correct casing, never "js/javascript/Javascript")
- dApp: Use "dApp" (correct casing, not "dapp/Dapp") - first mention can include "decentralized application (dApp)"
- Rollup: Always "Rollup" (capital R, never "rollup/roll up/roll-up")
- Layer terminology: Use "Parent chain" instead of "Layer 1" and "Child chain" instead of "Layer 2" (avoid L1/L2 abbreviations)
- Geth: Always "Geth" (capital G, not "geth")
- Oracle: Use lowercase "oracle" (not capitalized)
- Transactions: Write out "transaction/transactions" (never abbreviate as "tx/txs")
- Data availability: First mention as "Data availability server (DAS)", then "DAS" afterward
- Smart contract: Always lowercase "smart contract", can shorten to "contract" after first mention
- Cross-chain: Always hyphenated as "cross-chain" (not "cross chain" or "crosschain")
- Networks: Use "Arbitrum Goerli" (not "Nitro Goerli Rollup testnet")
- Standards: Format as "ERC-XX" with hyphen (e.g., "ERC-20", "ERC-721"), use backticks for code formatting
- Inclusive language: Use "allowlist/denylist" (not "whitelist/blacklist")
- Manager: First mention as "Sequencer Coordination Manager (SQM)", then "SQM"
- AnyTrust: Always "AnyTrust" (correct casing, not "anytrust/Anytrust")
- Currency: Use "ETH" or "Ether/ether" (not lowercase "eth" or mixed-case "Eth")
- EIP Standards: Format as "EIP-XXXX" with hyphen (e.g., "EIP-1134", "EIP-221"), use backticks for code formatting
- Arbitrum chains: Use "Your Arbitrum chain" (avoid "L3 Orbit chain" or "blockchain")
- Challenge period: "6.4 days to challenge an assertion" (distinguished from confirmation period)
- Bond: Use "Bonded funds for proposing" (preferred over "stake")

### Writing Style Principles

- Use sentence case for all headers, titles, and navigation elements (e.g., "Deploy your smart contract" not "Deploy Your Smart Contract")
- Create descriptive link text rather than using "here" or "this" for better user experience
- Maintain separation between procedural and conceptual content – include only necessary concepts in how-tos
- Address readers directly as "you" to create a personal connection
- Write conversationally, as if speaking to a smart friend who is in a hurry
- Use natural contractions to maintain a friendly, approachable tone
- Target specific audience personas with clearly defined needs and goals
- Prioritize information based on reader importance – lead with what matters most
- Define technical jargon when necessary, especially on first mention
- Spell out words like "and" or "or" rather than using symbols ("&" or "/")
- Aim for brief, accessible text that respects the reader's time
- Set clear expectations at the beginning of each document
- Be willing to cut unnecessary content – when in doubt, remove it
- Prioritize accessible accuracy over technical precision when extreme precision isn't required
- Clearly state prior knowledge assumptions and prerequisites at the top of documents
- Use American English spelling and grammar throughout all documentation
- Minimize technical jargon – use plain language when possible
- Use active voice and address readers directly with "you"
- Write concisely using short, clear sentences – break up complex ideas

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
