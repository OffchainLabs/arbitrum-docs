# Arbitrum Docs

Arbitrum Docs, built with docusaurus; docs are live at https://developer.arbitrum.io/.

[Arbitrum SDK](https://github.com/OffchainLabs/arbitrum-sdk) auto-genned docs are included as submodule.

## Contribution

For most of the docs content, you can contribute by simply reviewing our [docs contribution guidelines](https://docs.arbitrum.io/for-devs/contribute) and opening a PR!

The following are the only exceptions:

- Contributing to the three troubleshooting pages — [nodes](arbitrum-docs/partials/_troubleshooting-nodes-partial.md), [builders](arbitrum-docs/partials/_troubleshooting-building-partial.md), and [users](arbitrum-docs/partials/_troubleshooting-users-partial.md), as well as the [glossary](arbitrum-docs/partials/_glossary-partial.md) page — requires internal Offchain Labs access. If you'd like to make a suggestion about content on any of those pages, open an [issue ticket](https://github.com/OffchainLabs/arbitrum-docs/issues).

- To request to have your project added to the [3rd party node providers page](arbitrum-docs/node-running/node-providers.mdx), use [this form](https://docs.google.com/forms/d/e/1FAIpQLSc_v8j7sc4ffE6U-lJJyLMdBoIubf7OIhGtCqvK3cGPGoLr7w/viewform).

### Initial set up

```shell
git clone git@github.com:OffchainLabs/arbitrum-docs.git

cd arbitrum-docs/

git submodule update --init --recursive

cd website/
```

Install node dependencies

```
yarn
```

You will only need to generate docs once:

```
yarn generate_sdk_docs
```

### Dev Build

Live build without generating sdk docs (recommended):

```
yarn start_nitro_docs
```

(Re)generate sdk docs and live build:

```
yarn start
```

### Update submodules

Sdk repo:

```
git submodule update --remote arbitrum-sdk
```
