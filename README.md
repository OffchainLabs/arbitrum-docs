# Arbitrum Docs Site

Arbitrum Docs website, built with docusaurus; docs are live at https://developer.arbitrum.io/. 

The [Nitro](https://github.com/OffchainLabs/nitro/tree/master/docs) and [Arbitrum SDK](https://github.com/OffchainLabs/arbitrum-sdk) are included as submodules; if you're looking for the docs text / content, you probably want [Nitro](https://github.com/OffchainLabs/nitro/tree/master/docs).

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
Nitro repo:
```
git submodule update --remote nitro
```


Sdk repo: 
```
git submodule update --remote sdk
```