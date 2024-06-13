# Arbitrum Docs

Arbitrum Docs, built with docusaurus; docs are live at https://developer.arbitrum.io/.

[Arbitrum SDK](https://github.com/OffchainLabs/arbitrum-sdk) auto-genned docs are included as submodule.

## Contribution

For most of the docs content, you can contribute by simply reviewing our [docs contribution guidelines](https://docs.arbitrum.io/for-devs/contribute) and opening a PR!

The following are the only exceptions:

- Contributing to the three troubleshooting pages — [nodes](arbitrum-docs/partials/_troubleshooting-nodes-partial.md), [builders](arbitrum-docs/partials/_troubleshooting-building-partial.md), and [users](arbitrum-docs/partials/_troubleshooting-users-partial.md), as well as the [glossary](arbitrum-docs/partials/_glossary-partial.md) page — requires internal Offchain Labs access. If you'd like to make a suggestion about content on any of those pages, open an [issue ticket](https://github.com/OffchainLabs/arbitrum-docs/issues).

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
