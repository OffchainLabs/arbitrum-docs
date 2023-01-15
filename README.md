# Arbitrum Docs

Arbitrum Docs, built with docusaurus; docs are live at https://developer.arbitrum.io/. 

[Arbitrum SDK](https://github.com/OffchainLabs/arbitrum-sdk) auto-genned docs are included as submodule.

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