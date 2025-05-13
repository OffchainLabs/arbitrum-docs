# Arbitrum Docs

Arbitrum Docs, built with docusaurus; docs are live at https://developer.arbitrum.io/.

[Arbitrum SDK](https://github.com/OffchainLabs/arbitrum-sdk) auto-genned docs are included as submodule.

## Contribution

For most of the docs content, you can contribute by simply reviewing our [docs contribution guidelines](https://docs.arbitrum.io/for-devs/contribute) and opening a PR!

The following are the only exceptions:

- Contributing to the three troubleshooting pages — [nodes](arbitrum-docs/partials/_troubleshooting-nodes-partial.mdx), [builders](arbitrum-docs/partials/_troubleshooting-building-partial.mdx), and [users](arbitrum-docs/partials/_troubleshooting-users-partial.mdx), as well as the [glossary](arbitrum-docs/partials/_glossary-partial.md) page — requires internal Offchain Labs access. If you'd like to make a suggestion about content on any of those pages, open an [issue ticket](https://github.com/OffchainLabs/arbitrum-docs/issues).

- To request to have your project added to the [3rd party node providers page](arbitrum-docs/build-decentralized-apps/reference/01-node-providers.md), use [this form](https://docs.google.com/forms/d/e/1FAIpQLSc_v8j7sc4ffE6U-lJJyLMdBoIubf7OIhGtCqvK3cGPGoLr7w/viewform).

### Initial set up

```shell
git clone git@github.com:OffchainLabs/arbitrum-docs.git

cd arbitrum-docs/

git submodule update --init --recursive

cd website/
```

Install node dependencies

```shell
yarn
```

### Dev Build

To start a build server to serve the docs site locally, run this command from the `/website` directory:

```shell
yarn start
```

This command will both generate the `arbitrum-sdk` docs from the submodule and start the local server. In order to update the `arbitrum-sdk` docs, you will need to run this command again every time you update files in `arbitrum-sdk` directory.

### Build

While in the `/website` directory, this command will build the site:

```shell
yarn build
```

To test the build locally, you can use the following command:

```shell
yarn serve
```

### Update submodules

`arbitrum-sdk` repo:

```shell
git submodule update --remote arbitrum-sdk
```

### Update glossary

You can add any terms to the glossary by following these steps:

Let's assume you need to add the term "State Transition Function" to the glossary. 

1. create an `.mdx` file as follows: 

`arbitrum-docs/partials/glossary/_state-transition-function.mdx`

2. Ensure the content of your file should follow the following format:

```markdown
---
title: State Transition Function
key: state-transition-function
titleforSort: State Transition Function
---

The STF (State Transition Function) defines how new blocks are produced from input messages (i.e., transactions) in an Arbitrum chain.
```

3. While in the `/website` directory, run the following command:

```shell
npx tsx src/scripts/build-glossary.ts
```
 This part will update the glossary.

4. Commit your changes and open a PR.
