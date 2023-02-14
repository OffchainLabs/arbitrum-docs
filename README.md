# Arbitrum Docs

Arbitrum Docs, built with docusaurus; docs are live at https://developer.arbitrum.io/. 

[Arbitrum SDK](https://github.com/OffchainLabs/arbitrum-sdk) auto-genned docs are included as submodule.

## Contribution
Contributing to the three troubleshooting pages — [nodes](arbitrum-docs/partials/_troubleshooting-nodes-partial.md), [builders](arbitrum-docs/partials/_troubleshooting-building-partial.md), and [users](arbitrum-docs/partials/_troubleshooting-users-partial.md) — requires internal Offchain Labs access; for the rest of the docs, simply open a PR! 

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
