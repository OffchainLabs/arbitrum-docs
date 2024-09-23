---
title: 'How to configure the Data Availability Committee (DAC) in your chain'
description: This how-to will help you configure the DAC in your chain.
target_audience: 'Developers and node operators deploying and maintaining AnyTrust-based chains.'
author: TheGreatSoshiant, jose-franco
sme: TheGreatSoshiant, jose-franco
sidebar_position: 4
content_type: how-to
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.mdx';

<PublicPreviewBannerPartial />

<p>
  <a data-quicklook-from="arbitrum-anytrust-protocol">AnyTrust</a> chains rely on an external Data
  Availability Committee (DAC) to store data and provide it on-demand instead of using its{' '}
  <a data-quicklook-from="parent-chain">parent chain</a> as the Data Availability (DA) layer. The
  members of the DAC run a Data Availability Server (DAS) to handle these operations. Once the DA
  servers are running, the chain needs to be configured with their information to effectively store
  and retrieve data from them.
</p>

In this how-to, you'll learn how to configure the DAC in your chain. Refer to the _[Introduction](/run-arbitrum-node/data-availability-committees/01-get-started.md)_ for the full process of running DA servers and configuring the chain.

This how-to assumes that you're familiar with:

- The DAC's role in the AnyTrust protocol. Refer to _[Inside AnyTrust](/how-arbitrum-works/inside-anytrust.md)_ for a refresher.
- [Kubernetes](https://kubernetes.io/). The examples in this guide use Kubernetes to containerize your DAS.
- [How to deploy a Data Availability Server (DAS)](/run-arbitrum-node/data-availability-committees/02-deploy-das.md). This is needed to understand where the data we'll be handling in this guide comes from.
- The [Foundry toolkit](https://github.com/foundry-rs/foundry)

## Step 0: Prerequisites

Before starting to generate the keyset and configuring the nodes and chain, you'll need to gather the following information from all the DA servers run by the DAC members:

- Public BLS Key
- URL of the RPC endpoint
- URL(s) of the REST endpoint(s)

You should also make sure that at least one DAS is running as an [archive DAS](/run-arbitrum-node/data-availability-committees/02-deploy-das.md#archive-da-servers), otherwise the information will not be available after the expiry time.

## Step 1: Generate the keyset and keyset hash with all the information from the servers

### What is a keyset?

The AnyTrust protocol assumes that for the `n` members of the DAC, a minimum of `h` members maintain integrity. So `h` is then the minimum number of trusted committee members on an AnyTrust chain. In scenarios where `k = (n + 1) - h` members of the DAC pledge to grant access to a specific piece of information, these `k` members must sign and attest they have stored the data to be considered successful.

To perform this signing operation, each DAC member must generate their own set of BLS public and private keys. They should do this independently and ensure these keys are random and only used by them. You can find more information about how to generate a BLS pair of keys in [Generating BLS Keys](/run-arbitrum-node/data-availability-committees/deploy-das#step-1-generate-the-bls-keypair).

An Anytrust chain needs to know all DAC members' public keys to validate the integrity of the data being batched and posted. A _keyset_ is a list of all DAC members' RPC endpoint and BLS public key. Additionally, it also contains information about how many signatures are needed to approve a <a data-quicklook-from="data-availability-certificate">Data Availability Certificate (DACert)</a>, via a special `assumed-honest` parameter (i.e., the `h` parameter we mentioned above). This design lets the chain owner modify the DAC membership over time, and DAC members change their keys if needed. See _[Inside AnyTrust](/how-arbitrum-works/inside-arbitrum-nitro#inside-anytrust)_ for more information.

We use this keyset, and its hash to configure the SequencerInbox contract with the valid keyset, and also the batch poster (to request storing information) and full nodes (to request information already stored).

### How to generate a keyset and a keyset hash

Nitro comes with a special tool to generate both the keyset and the keyset hash. To use it, you need to first structure the keyset information in a JSON object with the following structure:

```json
{
    "keyset": {
      "assumed-honest": h,
      "backends": [
        {
          "url": "https://rpc-endpoint-of-member-1/",
          "pubkey":"PUBLIC_KEY_OF_MEMBER_1"
        },
        {
          "url": "https://rpc-endpoint-of-member-2/",
          "pubkey":"PUBLIC_KEY_OF_MEMBER_2"
        },

        ...

        {
          "url": "https://rpc-endpoint-of-member-n/",
          "pubkey":"PUBLIC_KEY_OF_MEMBER_N"
        }
      ]
    }
}
```

The JSON fields represent the following:

- `assumed_honest` is the amount of members that we assume are honest from the `n` members of the DAC. This is the `h` variable we mentioned in the previous section.
- `backends` contain information about each member of the DAC:
  - `url` contains the RPC endpoint of the DAS run by that member
  - `pubkey` contains the base64-encoded BLS public key used in the DAS run by that member

Once you have the JSON structure, save it into a file, for example, `keyset-info.json`.

Finally, we'll use Nitro's `datool dumpkeyset` utility inside Docker to generate the keyset and keyset hash.

```shell
docker run -v $(pwd):/data/keyset --entrypoint datool @latestNitroNodeImage@ dumpkeyset --conf.file /data/keyset/keyset-info.json
```

This command will output two results: `Keyset` and `KeysetHash`. Save them to use in the next steps.

### Example with mocked-up data

Here's an example that uses mocked-up data:

The JSON file is:

```json
{
  "keyset": {
    "assumed-honest": 2,
    "backends": [
      {
        "url": "http://example",
        "pubkey": "YAbcteVnZLty5qRebeswHKhdjEMVwdou+imSfyrI+yVXHOMdLWA3Nf4DGW9tVry/mhmZqJp01TaYIsREXWdsFe1S5QCNqnddyag5yZ/5Y6GZRqx0BXmHTaxPY5kHrhvGnwxmlJVbUk1xjKRFgxxTdTk3c0AfM3JaeWYTed3avV//KGGdwHC+/Z7XPWmeXCNsGhY75YuoEAK2EwcJvAZK9de6lHEwtyBWvxcmOADxo6siacalEO+OdBL9VtHvG5FqEwbjsdnILAmTcb2YYVgqyq2joW6d/uXQ685hCWWYqC8RLQqTXoyrXEjYLjEEsMe6eRV9rRoBmj5/atB3uOYwixFv7A9YI5YiRjw2MfoB4rQnJAkhW4AJQiwWcV2+3lkJBg=="
      },
      {
        "url": "http://example",
        "pubkey": "YAg1+ZXyR48kiS0FDaoon4trnBsYW80oUy+I1hDCZCotxvNQl0AjbTPD4tkTaqsX+BnIxnEpO7ondxd2Lo0cH3usnhfdKNKTmpWbs45QD5wRw4zrvEJuLeqXxAF1plXRdACubHX/SeiEx5RpJJ5wlTJYhUtk+oRFxYWtRdxtxpdVAcavfP9wdCAsaH+Ke/GjrBkmiXVfIyJ1tMhCGxpWaem5BMKaKSzflht4OnwLTOc2kA3k2MY8X4WmXLRK80vvhArO+Eq3X0TEyRN2ELaBB6/zu9zBkRnHqSfBFbe5v7J9hcUA7nfRPsWpejrmv1HTtwpVAuhBbee1646f7uN2QRyjXIp/P1l8dgZXjPlqRxXOWjXPSOOcCh+qLe4i105oGQ=="
      }
    ]
  }
}
```

And when running the command we obtain:

```shell
$ docker run -v $(pwd):/data/keyset --entrypoint datool @latestNitroNodeImage@ dumpkeyset --conf.file /data/keyset/keyset-info.json
Keyset: 0x0000000000000002000000000000000201216006dcb5e56764bb72e6a45e6deb301ca85d8c4315c1da2efa29927f2ac8fb25571ce31d2d603735fe03196f6d56bcbf9a1999a89a74d5369822c4445d676c15ed52e5008daa775dc9a839c99ff963a19946ac740579874dac4f639907ae1bc69f0c6694955b524d718ca445831c5375393773401f33725a79661379dddabd5fff28619dc070befd9ed73d699e5c236c1a163be58ba81002b6130709bc064af5d7ba947130b72056bf17263800f1a3ab2269c6a510ef8e7412fd56d1ef1b916a1306e3b1d9c82c099371bd9861582acaada3a16e9dfee5d0ebce61096598a82f112d0a935e8cab5c48d82e3104b0c7ba79157dad1a019a3e7f6ad077b8e6308b116fec0f58239622463c3631fa01e2b4272409215b8009422c16715dbede5909060121600835f995f2478f24892d050daa289f8b6b9c1b185bcd28532f88d610c2642a2dc6f3509740236d33c3e2d9136aab17f819c8c671293bba277717762e8d1c1f7bac9e17dd28d2939a959bb38e500f9c11c38cebbc426e2dea97c40175a655d17400ae6c75ff49e884c79469249e70953258854b64fa8445c585ad45dc6dc6975501c6af7cff7074202c687f8a7bf1a3ac192689755f232275b4c8421b1a5669e9b904c29a292cdf961b783a7c0b4ce736900de4d8c63c5f85a65cb44af34bef840acef84ab75f44c4c9137610b68107aff3bbdcc19119c7a927c115b7b9bfb27d85c500ee77d13ec5a97a3ae6bf51d3b70a5502e8416de7b5eb8e9feee376411ca35c8a7f3f597c7606578cf96a4715ce5a35cf48e39c0a1faa2dee22d74e6819
KeysetHash: 0xfdca3e4e2de25f0a56d0ced68fd1cc64f91b20cde67c964c55105477c02f49be
```

## Step 2: Update the SequencerInbox contract

Once we have the keyset and its hash, we can configure the SequencerInbox contract so it accepts DACerts signed by the DAC members.

The SequencerInbox can be configured with the new keyset by invoking the [setValidKeyset](https://github.com/OffchainLabs/nitro-contracts/blob/@nitroContractsCommit@/src/bridge/SequencerInbox.sol#L751) method. Note that only the chain owner can call this method.

Here's an example of how to use Foundry to configure the SequencerInbox with the keyset generated in the previous step:

```shell
cast send --rpc-url $PARENT_CHAIN_RPC --private-key $CHAIN_OWNER_PRIVATE_KEY $SEQUENCERINBOX_ADDRESS "setValidKeyset(bytes)" 0x0000000000000002000000000000000201216006dcb5e56764bb72e6a45e6deb301ca85d8c4315c1da2efa29927f2ac8fb25571ce31d2d603735fe03196f6d56bcbf9a1999a89a74d5369822c4445d676c15ed52e5008daa775dc9a839c99ff963a19946ac740579874dac4f639907ae1bc69f0c6694955b524d718ca445831c5375393773401f33725a79661379dddabd5fff28619dc070befd9ed73d699e5c236c1a163be58ba81002b6130709bc064af5d7ba947130b72056bf17263800f1a3ab2269c6a510ef8e7412fd56d1ef1b916a1306e3b1d9c82c099371bd9861582acaada3a16e9dfee5d0ebce61096598a82f112d0a935e8cab5c48d82e3104b0c7ba79157dad1a019a3e7f6ad077b8e6308b116fec0f58239622463c3631fa01e2b4272409215b8009422c16715dbede5909060121600835f995f2478f24892d050daa289f8b6b9c1b185bcd28532f88d610c2642a2dc6f3509740236d33c3e2d9136aab17f819c8c671293bba277717762e8d1c1f7bac9e17dd28d2939a959bb38e500f9c11c38cebbc426e2dea97c40175a655d17400ae6c75ff49e884c79469249e70953258854b64fa8445c585ad45dc6dc6975501c6af7cff7074202c687f8a7bf1a3ac192689755f232275b4c8421b1a5669e9b904c29a292cdf961b783a7c0b4ce736900de4d8c63c5f85a65cb44af34bef840acef84ab75f44c4c9137610b68107aff3bbdcc19119c7a927c115b7b9bfb27d85c500ee77d13ec5a97a3ae6bf51d3b70a5502e8416de7b5eb8e9feee376411ca35c8a7f3f597c7606578cf96a4715ce5a35cf48e39c0a1faa2dee22d74e6819
```

## Step 3: Craft the new configuration for the batch poster

To configure the batch poster, we'll use the JSON structure we created in Step 1. This will allow the batch poster to send RPC requests to all the DA servers (to store the information of the transactions being included in the next batch), craft the DACert, and store it in the SequencerInbox.

The configuration to enable the DAC in the batch poster looks like this:

```json
{
  ...

  "data-availability": {
    "enable": true,
    "rpc-aggregator": {
      "enable": true,
      "assumed-honest": h,
      "backends": [
        {
          "url": "https://rpc-endpoint-of-member-1/",
          "pubkey":"PUBLIC_KEY_OF_MEMBER_1"
        },
        {
          "url": "https://rpc-endpoint-of-member-2/",
          "pubkey":"PUBLIC_KEY_OF_MEMBER_2"
        },

        ...

        {
          "url": "https://rpc-endpoint-of-member-n/",
          "pubkey":"PUBLIC_KEY_OF_MEMBER_N"
        }
      ]
    }
  },

  ...
}
```

The following parameters are used:

- `data-availability.enable`: tells the batch poster to handle information stored in a DAC
- `data-availability.rpc-aggregator`: includes information of the RPC endpoints of all the DA servers run by DAC members.
  - `enable`: tells the batch poster that the RPC aggregator will be used
  - `assumed` and `backends`: include information from the DA servers (following the same format as specified in Step 1)

Once the configuration is in place, you can restart your batch poster so it begins communicating with the DA servers to store transaction data, while storing the DACert in the SequencerInbox.

## Step 4: Craft the new configuration for your chain's nodes

Finally, we also need to configure all other nodes so they can communicate with the DAC. To do that, we'll also use the JSON structure we created in Step 1.

The configuration to enable the DAC in a full node looks like this:

```json
{
  ...

  "data-availability": {
    "enable": true,
    "rest-aggregator": {
      "enable": true,
      "urls": [
          "https://rest-endpoint-of-member-1/",
          "https://rest-endpoint-of-member-2/",
          ...
          "https://rest-endpoint-of-member-n/",
      ],
      "online-url-list": "https://url-of-list-of-rest-endpoints"
    }
  },

  ...
}
```

The following parameters are used:

- `data-availability.enable`: tells the node to query information from the DAC
- `data-availability.rest-aggregator`: includes information on the REST endpoints of all the DA servers run by DAC members.
  - `enable`: tells the node that the REST aggregator will be used
  - `urls` or `online-url-list`: usually only one of these is used, although both parameters can be used and the information will be aggregated together. `urls` is a list of all REST endpoints of the DA servers, and `online-url-list` is a URL to a list of URLs of the REST endpoints of the DA servers.

Once the configuration is in place, you can restart your node so it begins communicating with the DA servers to retrieve transaction data.
