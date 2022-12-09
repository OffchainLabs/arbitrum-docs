# Arbitrum Docs

Arbitrum Docs, built with docusaurus; docs are live at https://developer.arbitrum.io/. 

[Arbitrum SDK](https://github.com/OffchainLabs/arbitrum-sdk) auto-genned docs are included as submodule.

## Local Build

```shell
cd ./website
```

### Initial set up

```
yarn
```

```
yarn generate_sdk_docs
```

### Dev Build

Live build without generating sdk docs (recommended):

```
yarn start_nitro_docs 
```


Generate sdk docs and live build:
```
yarn start
```


### Update submodules

Sdk repo: 
```
git submodule update --remote arbitrum-sdk
```