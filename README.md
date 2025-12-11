# Arbitrum Docs

Arbitrum Docs, built with docusaurus; docs are live at https://developer.arbitrum.io/.

## File structure

This repository is organized as follows:

### Documentation Content

- **`docs/`** - Main documentation content directory
  - `arbitrum-bridge/` - Bridge-related documentation
  - `build-decentralized-apps/` - Developer guides and references
  - `for-devs/` - Developer tools and third-party integrations
  - `for-users/` - User-focused documentation
  - `how-arbitrum-works/` - Technical explanations of Arbitrum
  - `intro/` - Introduction and glossary
  - `launch-arbitrum-chain/` - Arbitrum chain deployment guides
  - `learn-more/` - Additional learning resources
  - `node-running/` - Node operation guides
  - `partials/` - Reusable content components and troubleshooting guides
  - `run-arbitrum-node/` - Node setup and configuration
  - `sdk/` - Auto-generated SDK documentation - Do not edit
  - `stylus/` - Stylus smart contract development
  - `stylus-by-example/` - Generated Stylus examples - Do not edit
  - `welcome/` - Getting started content

### Application Code

- **`src/`** - Docusaurus application source code
  - `components/` - React components for the documentation site
  - `css/` - Styling and themes
  - `pages/` - Custom pages and landing pages
  - `resources/` - Global variables and configuration
  - `scripts/` - Build scripts
  - `theme/` - Docusaurus theme customizations

### Configuration & Dependencies

- **`submodules/`** - Git submodule containing SDK source code
  - **`arbitrum-sdk/`** - Git submodule containing SDK source code
  - **`stylus-by-example/`** - Git submodule containing Stylus examples
- **`scripts/`** - Repository maintenance, build scripts, and content generators
- **`static/`** - Static assets (images, files, JSON data)

## Contribution

For most of the docs content, you can contribute by simply reviewing our [docs contribution guidelines](https://docs.arbitrum.io/for-devs/contribute) and opening a PR!

The following are the only exceptions:

- Contributing to the three troubleshooting pages — [nodes](docs/partials/_troubleshooting-nodes-partial.mdx), [builders](docs/partials/_troubleshooting-building-partial.mdx), and [users](docs/partials/_troubleshooting-users-partial.mdx) require internal Offchain Labs access. If you'd like to make a suggestion about content on any of those pages, open an [issue ticket](https://github.com/OffchainLabs/arbitrum-docs/issues).

- To request to have your project added to the [3rd party node providers page](docs/build-decentralized-apps/reference/01-node-providers.mdx), use [this form](https://docs.google.com/forms/d/e/1FAIpQLSc_v8j7sc4ffE6U-lJJyLMdBoIubf7OIhGtCqvK3cGPGoLr7w/viewform).

### Initial set up

1. Clone this repo

```shell
git clone git@github.com:OffchainLabs/arbitrum-docs.git
```

2.Install node dependencies

```shell
yarn
```

3.Update the submodules

```shell
git submodule update --init --recursive
```

4. Build

```shell
yarn build
```

5. Start the development server

```shell
yarn start
```

### Dev Build

To start a build server to serve the docs site locally, run this command from the root directory:

```shell
yarn start
```

### Build

While in the root directory, this command will build the site:

```shell
yarn build
```

To test the build locally, you can use the following command:

```shell
yarn serve
```

### Update glossary

You can add any terms to the glossary by following these steps:

Let's assume you need to add the term "State Transition Function" to the glossary.

1. Create an `.mdx` file as follows:

`docs/partials/glossary/_state-transition-function.mdx`

2. Ensure that the content of your file follows the following format:

```markdown
---
title: State Transition Function
key: state-transition-function
titleforSort: State Transition Function
---

The STF (State Transition Function) defines how new blocks are produced from input messages (i.e., transactions) in an Arbitrum chain.
```

3. While in the root directory, run the following command:

```shell
npx tsx scripts/build-glossary.ts
```

This part will update the glossary.

4. Commit your changes and open a PR.

### Formatting

1. Run `yarn format` from the root directory.

### Redirects

1. From the root directory, run `yarn check-redirects`.
