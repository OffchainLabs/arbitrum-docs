---
title: 'How to generate a keyset for a DAC'
description: This how-to will help you configure the DAC in your chain.
author: TheGreatSoshiant
sme: TheGreatSoshiant
sidebar_position: 4
target_audience: 'Developers and node operators deploying and maintaining AnyTrust-based chains.'
content_type: how-to
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

The DAC has `N` members; the AnyTrust protocol assumes that a minimum of `H` `DAC` members maintain integrity. `H` is the minimum number of trusted committee members on AnyTrust chains, configurable by the chain's owner via the `assumed-honest` parameter in the Keyset. In scenarios where `K = (N + 1) - H` members of the DAC pledge to grant access to specific data, they must sign and attest they have the data for storage to be considered successful.

Each DAC member gets their own set of BLS public and private keys. Every member needs to create their own new and secure BLS keys. They should do this independently and ensure these keys are random and only for their use. If you need help generating BLS keys, please refer to our guide on generating keys in the Arbitrum documentation: [Generating BLS Keys](/run-arbitrum-node/data-availability-committees/deploy-das#step-1-generate-the-bls-keypair).

The main blockchain (parent chain) needs to know all DAC members' names and public keys to validate the integrity of the data being batched and posted. A 'keyset' is a list of all DAC members' public keys. It also shows how many signatures are needed to approve a <a data-quicklook-from="data-availability-certificate">Data Availability Certificate</a>. This design lets the chain owner modify the DAC's membership over time and lets DAC members change their keys if needed. See [Inside AnyTrust](/how-arbitrum-works/inside-arbitrum-nitro#inside-anytrust) for more information.

In the following section, we will provide a detailed guide on generating a Keyset corresponding to your individual set of keys and instructions for its subsequent configuration within the chain.

### Batch poster configuration

AnyTrust works with a group of Data Availability Servers, forming a committee that ensures transaction data is accessible. When setting up the Nitro <a data-quicklook-from="batch">Batch</a> Poster, you need to provide specific information for each committee member. This includes each member's URL, BLS public key, and a parameter known as `assumed-honest`. As mentioned, assumed-honest refers to the minimum number of committee members we trust.

To ensure data is stored properly, a certain number of committee members need to confirm they have the data. This number is calculated as `K = (N + 1) - H`, where `N` is the total number of committee members and `H` is the minimum number of members assumed to be honest.

Someone setting up an AnyTrust node would need to first set up the committee of Data Availability Servers, including generating their BLS keys. You can learn more about this topic [in this guide explaining the process of generating BLS keys ](run-arbitrum-node/data-availability-committees/deploy-das#step-1-generate-the-bls-keypair).

Here is a sample of the `JSON` configuration, taken from a past configuration of <a data-quicklook-from="arbitrum-nova">Arbitrum Nova</a>, which was used with the batch poster configuration. Note that due to a quirk in a configuration library we use in Nitro, the `backends` field is an escaped JSON string with `url`, and `pubkey`. `pubkey` is the base64 encoded BLS public key of the committee member.

```shell
{
...
  "data-availability": {
    "enable": true,
    "rpc-aggregator": {
			"enable": true,
			"assumed-honest": 2,
      "backends": "[{"url":"http://example","pubkey":"YAbcteVnZLty5qRebeswHKhdjEMVwdou+imSfyrI+yVXHOMdLWA3Nf4DGW9tVry/mhmZqJp01TaYIsREXWdsFe1S5QCNqnddyag5yZ/5Y6GZRqx0BXmHTaxPY5kHrhvGnwxmlJVbUk1xjKRFgxxTdTk3c0AfM3JaeWYTed3avV//KGGdwHC+/Z7XPWmeXCNsGhY75YuoEAK2EwcJvAZK9de6lHEwtyBWvxcmOADxo6siacalEO+OdBL9VtHvG5FqEwbjsdnILAmTcb2YYVgqyq2joW6d/uXQ685hCWWYqC8RLQqTXoyrXEjYLjEEsMe6eRV9rRoBmj5/atB3uOYwixFv7A9YI5YiRjw2MfoB4rQnJAkhW4AJQiwWcV2+3lkJBg=="},{"url":"http://example","pubkey":"YAg1+ZXyR48kiS0FDaoon4trnBsYW80oUy+I1hDCZCotxvNQl0AjbTPD4tkTaqsX+BnIxnEpO7ondxd2Lo0cH3usnhfdKNKTmpWbs45QD5wRw4zrvEJuLeqXxAF1plXRdACubHX/SeiEx5RpJJ5wlTJYhUtk+oRFxYWtRdxtxpdVAcavfP9wdCAsaH+Ke/GjrBkmiXVfIyJ1tMhCGxpWaem5BMKaKSzflht4OnwLTOc2kA3k2MY8X4WmXLRK80vvhArO+Eq3X0TEyRN2ELaBB6/zu9zBkRnHqSfBFbe5v7J9hcUA7nfRPsWpejrmv1HTtwpVAuhBbee1646f7uN2QRyjXIp/P1l8dgZXjPlqRxXOWjXPSOOcCh+qLe4i105oGQ=="},{"url":"http://example","pubkey":"YAXbmOUQgLs5Kntevb/PM+D08BkxAsxA95qe8KlVfFpi3R74AAVpRugyn5eboMyCUQ0Nx4w8zv+mbuXeXimJh6mFi/UmIXFhTlVvQGh85pEsvqaltERyyz/xB+zmnL0P2g2zkqZKgr5xQHc1HWOE1s6iVK08IeRah4UtrDkZCGXESaZHpOOZKNrXYRsNIHRDfRfkTHZvPgoVCFLN4jXUVScbkeygPX7JHJEMo4VA9verlPy/pMQ6TdDwZLYhADfZNws61wLriD3L965tj+ZSkWRZRpLwD5iIwud9E16SJYWtnOHBYpG5qz5KmFgrPt0gmhAKAF/kT6LkhDvxmVmRqL+1rw/SxeV0mkqW2IZfMc77k2j2/qy2HyR38krTMrZVMg=="},{"url":"https://example","pubkey":"YAbOg53k1qOuAvJbQIlTHmo9LeVWvQBr0wzy00CLl30Y8XVt1KG8PADbkALw2O8a9Q+6ppWd7L7By+I0zG72JwoDM5CQ4COPisn4oY9EuHNMjzthI90SiuSKCGO5p/bYgwIENoF3LCt581DBS8nXsY5XjHlcp2klznvSiR0Jqjf+LOHqL/5MA4/vIvZuKJlcYQkCIehqM2j7bWcar8GQAfQif5LzZxr2pgs9sShaFC9JwfRQt2/rmxrvGlUehY5LcwLGzxyn+sBbmTujddgYP5DAifqKPfMaRD0uCo7xkwZwaPv8yizvI0z22cm1iE72lwWnGBClZlFybKO3rN+v/fq5soRLTqaHK0P/m32i4QouI6eRMMPExwqK0Kd+stUfFg=="},{"url":"https://example","pubkey":"YA+HK4mKT9G4rnNRX30zzXvh6XHOGJaqvvL4km5YbEJI3A23/XhRQCwUFJ3D3ITzgww0YWfDnlMjlxrDQEFfCi6wVKmo4KXVA6Ks/s690d9xrurDs4JgSAxpm8CZNPCRPg7lquq9VzEyhSB+uJNmtBEobPPxxeMOt+NV9VOFMIuR1YByhDI+6JqXQ8cGdvSUlQTO0+1BYSy/2gatVSAMHHfT+zcABZvv1kxEvEpXy1Z+wUge5WTPbNbPHy9KLe5tsAxUfDhACrEY3tror9W6uTtwP3agmRuqXUP7sSUZTAa1Rh+Mc4o8Qnij2Y5UVq7AcgiDwNKJGVN6NuL/1fcx50K2ZTVX0VTBZOBo75g7Nn72Jvqu1G9Orey7ErflXyMXXQ=="},{"url":"https://example","pubkey":"YALC7DeOtroXqegbj9RCY9aZw0cZSSpOzx7napQrwiR4+3qflOLxWCJjDy1hbDKjNAOHEY5LluJtbkHbqrn+J61gi9gjoUL5iPfamZzeygirSv7baz2i1NsgjMC6kb/UThU71zc2t98BNBeAqqfxhfyg06R437U7YS7ZHwVEFt571ixZ05tO5gTqlstC89aqIBEhl7S5rPc25H+0TPAMvjclIn2K6lvKHvu7iUwcu1ZqerG3Aegdr9W58wd85Piy+AAKBH+4jcXc+K/udljfD5hTM6MVFvumIgB2D+QlbAJgsZmUlzf7iPd9dcNd6kNJJhIT7mvrv/NQIEr/fNhGFlG+1Xy0VRhLkKv1ahuyPe/+qbsl2uxc0r6dfOAQcZudWg=="},{"url":"https://example","pubkey":"YBN+CWUmeRP56vhb/yLjzl9Euxv67XZ5sWgKzRVDaoQyXrp/KWLKRpN8y/Rtme3JRANM3Ze8T7HY3DrducNIQxqZl1lZ5qyCODdq8x8D51T6PDFZJ81oYCZeyObpfaQKlQkyd3PnqlvPrvdpDXaQYzNvbVIQp95V4OvyUf/VP23KAiJn+8P/wI5HCeNBSpa4BAVt1+f/w4kn2KPYpcD0ao5zfWOOie9clvxd/nmiHaCitcvQwbsulcqbv/HUFlhcLAEZtnbcBTxauzsLTWDq+gZXFaLDAajVi6yHHfg238DrjU7eGRyrTPZlVFGjfJzzdggqZdXyO4GMGFxWsWzpgLb+DWiDj95nePzGUs9oE/79Ids3J0VN9ZrTvnRl1gUHqg=="},{"url":"https://example","pubkey":"YAR40SbOOU71LW/8aEVnLfztsU1Mq+dqzZ7/8liSsx3DLYvSFCZXXwijCxuEu4wfZQeBDiXUeFLx8qBrZrU0HQLXSBoczgElfnaKoaWbaDoo9veUZnRUHw9OI2Q9Md/X6QlYo2HH24a2KP4HXZTIXixD+FjT82g9U2mof3azkCwHZd3IyQTjdbD1dA210uJfGxWalm4gWWsaOP8xG1Nl13CcxnmZEwfWkhUs/0mHZmPzFeCB9MC8hcOKZvIZjVOQFwwnXiPphD6nSgRrPnCEqqHVPG/GyGIiUNy4EtREw0GoRw30ssLsOrDUqlY7EBoxUg1x3wycHuxIGMuuyzJKwrkEWusxa7H0xsmqySR/HsP7gkJH84WNG5xgMUE6EaewWQ=="}]"
    }
  }
...
}
```

### Keyset Generation

For the Batch Poster to be able to post batches, the Keyset corresponding to the configuration it is using must be enabled on the Inbox contract. You’ll need to generate the keyset and keyset hash binary blobs to pass to the `SetValidKeyset` call on the Inbox contract. Here’s an example using the same Nova @Keyset 8 configuration as before and the datool utility, which is distributed with Nitro:

```shell
{
    "keyset": {
      "assumed-honest": 2,
      "backends": "[{"url":"http://example","pubkey":"YAbcteVnZLty5qRebeswHKhdjEMVwdou+imSfyrI+yVXHOMdLWA3Nf4DGW9tVry/mhmZqJp01TaYIsREXWdsFe1S5QCNqnddyag5yZ/5Y6GZRqx0BXmHTaxPY5kHrhvGnwxmlJVbUk1xjKRFgxxTdTk3c0AfM3JaeWYTed3avV//KGGdwHC+/Z7XPWmeXCNsGhY75YuoEAK2EwcJvAZK9de6lHEwtyBWvxcmOADxo6siacalEO+OdBL9VtHvG5FqEwbjsdnILAmTcb2YYVgqyq2joW6d/uXQ685hCWWYqC8RLQqTXoyrXEjYLjEEsMe6eRV9rRoBmj5/atB3uOYwixFv7A9YI5YiRjw2MfoB4rQnJAkhW4AJQiwWcV2+3lkJBg=="},{"url":"http://example","pubkey":"YAg1+ZXyR48kiS0FDaoon4trnBsYW80oUy+I1hDCZCotxvNQl0AjbTPD4tkTaqsX+BnIxnEpO7ondxd2Lo0cH3usnhfdKNKTmpWbs45QD5wRw4zrvEJuLeqXxAF1plXRdACubHX/SeiEx5RpJJ5wlTJYhUtk+oRFxYWtRdxtxpdVAcavfP9wdCAsaH+Ke/GjrBkmiXVfIyJ1tMhCGxpWaem5BMKaKSzflht4OnwLTOc2kA3k2MY8X4WmXLRK80vvhArO+Eq3X0TEyRN2ELaBB6/zu9zBkRnHqSfBFbe5v7J9hcUA7nfRPsWpejrmv1HTtwpVAuhBbee1646f7uN2QRyjXIp/P1l8dgZXjPlqRxXOWjXPSOOcCh+qLe4i105oGQ=="},{"url":"http://example","pubkey":"YAXbmOUQgLs5Kntevb/PM+D08BkxAsxA95qe8KlVfFpi3R74AAVpRugyn5eboMyCUQ0Nx4w8zv+mbuXeXimJh6mFi/UmIXFhTlVvQGh85pEsvqaltERyyz/xB+zmnL0P2g2zkqZKgr5xQHc1HWOE1s6iVK08IeRah4UtrDkZCGXESaZHpOOZKNrXYRsNIHRDfRfkTHZvPgoVCFLN4jXUVScbkeygPX7JHJEMo4VA9verlPy/pMQ6TdDwZLYhADfZNws61wLriD3L965tj+ZSkWRZRpLwD5iIwud9E16SJYWtnOHBYpG5qz5KmFgrPt0gmhAKAF/kT6LkhDvxmVmRqL+1rw/SxeV0mkqW2IZfMc77k2j2/qy2HyR38krTMrZVMg=="},{"url":"https://example","pubkey":"YAbOg53k1qOuAvJbQIlTHmo9LeVWvQBr0wzy00CLl30Y8XVt1KG8PADbkALw2O8a9Q+6ppWd7L7By+I0zG72JwoDM5CQ4COPisn4oY9EuHNMjzthI90SiuSKCGO5p/bYgwIENoF3LCt581DBS8nXsY5XjHlcp2klznvSiR0Jqjf+LOHqL/5MA4/vIvZuKJlcYQkCIehqM2j7bWcar8GQAfQif5LzZxr2pgs9sShaFC9JwfRQt2/rmxrvGlUehY5LcwLGzxyn+sBbmTujddgYP5DAifqKPfMaRD0uCo7xkwZwaPv8yizvI0z22cm1iE72lwWnGBClZlFybKO3rN+v/fq5soRLTqaHK0P/m32i4QouI6eRMMPExwqK0Kd+stUfFg=="},{"url":"https://example","pubkey":"YA+HK4mKT9G4rnNRX30zzXvh6XHOGJaqvvL4km5YbEJI3A23/XhRQCwUFJ3D3ITzgww0YWfDnlMjlxrDQEFfCi6wVKmo4KXVA6Ks/s690d9xrurDs4JgSAxpm8CZNPCRPg7lquq9VzEyhSB+uJNmtBEobPPxxeMOt+NV9VOFMIuR1YByhDI+6JqXQ8cGdvSUlQTO0+1BYSy/2gatVSAMHHfT+zcABZvv1kxEvEpXy1Z+wUge5WTPbNbPHy9KLe5tsAxUfDhACrEY3tror9W6uTtwP3agmRuqXUP7sSUZTAa1Rh+Mc4o8Qnij2Y5UVq7AcgiDwNKJGVN6NuL/1fcx50K2ZTVX0VTBZOBo75g7Nn72Jvqu1G9Orey7ErflXyMXXQ=="},{"url":"https://example","pubkey":"YALC7DeOtroXqegbj9RCY9aZw0cZSSpOzx7napQrwiR4+3qflOLxWCJjDy1hbDKjNAOHEY5LluJtbkHbqrn+J61gi9gjoUL5iPfamZzeygirSv7baz2i1NsgjMC6kb/UThU71zc2t98BNBeAqqfxhfyg06R437U7YS7ZHwVEFt571ixZ05tO5gTqlstC89aqIBEhl7S5rPc25H+0TPAMvjclIn2K6lvKHvu7iUwcu1ZqerG3Aegdr9W58wd85Piy+AAKBH+4jcXc+K/udljfD5hTM6MVFvumIgB2D+QlbAJgsZmUlzf7iPd9dcNd6kNJJhIT7mvrv/NQIEr/fNhGFlG+1Xy0VRhLkKv1ahuyPe/+qbsl2uxc0r6dfOAQcZudWg=="},{"url":"https://example","pubkey":"YBN+CWUmeRP56vhb/yLjzl9Euxv67XZ5sWgKzRVDaoQyXrp/KWLKRpN8y/Rtme3JRANM3Ze8T7HY3DrducNIQxqZl1lZ5qyCODdq8x8D51T6PDFZJ81oYCZeyObpfaQKlQkyd3PnqlvPrvdpDXaQYzNvbVIQp95V4OvyUf/VP23KAiJn+8P/wI5HCeNBSpa4BAVt1+f/w4kn2KPYpcD0ao5zfWOOie9clvxd/nmiHaCitcvQwbsulcqbv/HUFlhcLAEZtnbcBTxauzsLTWDq+gZXFaLDAajVi6yHHfg238DrjU7eGRyrTPZlVFGjfJzzdggqZdXyO4GMGFxWsWzpgLb+DWiDj95nePzGUs9oE/79Ids3J0VN9ZrTvnRl1gUHqg=="},{"url":"https://example","pubkey":"YAR40SbOOU71LW/8aEVnLfztsU1Mq+dqzZ7/8liSsx3DLYvSFCZXXwijCxuEu4wfZQeBDiXUeFLx8qBrZrU0HQLXSBoczgElfnaKoaWbaDoo9veUZnRUHw9OI2Q9Md/X6QlYo2HH24a2KP4HXZTIXixD+FjT82g9U2mof3azkCwHZd3IyQTjdbD1dA210uJfGxWalm4gWWsaOP8xG1Nl13CcxnmZEwfWkhUs/0mHZmPzFeCB9MC8hcOKZvIZjVOQFwwnXiPphD6nSgRrPnCEqqHVPG/GyGIiUNy4EtREw0GoRw30ssLsOrDUqlY7EBoxUg1x3wycHuxIGMuuyzJKwrkEWusxa7H0xsmqySR/HsP7gkJH84WNG5xgMUE6EaewWQ=="}]"
    }
}
```

```shell
.../nitro $ ./target/bin/datool dumpkeyset --conf.file datestconf/datool-keyset.conf
Keyset: 0x0000000000000002000000000000000801216006dcb5e56764bb72e6a45e6deb301ca85d8c4315c1da2efa29927f2ac8fb25571ce31d2d603735fe03196f6d56bcbf9a1999a89a74d5369822c4445d676c15ed52e5008daa775dc9a839c99ff963a19946ac740579874dac4f639907ae1bc69f0c6694955b524d718ca445831c5375393773401f33725a79661379dddabd5fff28619dc070befd9ed73d699e5c236c1a163be58ba81002b6130709bc064af5d7ba947130b72056bf17263800f1a3ab2269c6a510ef8e7412fd56d1ef1b916a1306e3b1d9c82c099371bd9861582acaada3a16e9dfee5d0ebce61096598a82f112d0a935e8cab5c48d82e3104b0c7ba79157dad1a019a3e7f6ad077b8e6308b116fec0f58239622463c3631fa01e2b4272409215b8009422c16715dbede5909060121600835f995f2478f24892d050daa289f8b6b9c1b185bcd28532f88d610c2642a2dc6f3509740236d33c3e2d9136aab17f819c8c671293bba277717762e8d1c1f7bac9e17dd28d2939a959bb38e500f9c11c38cebbc426e2dea97c40175a655d17400ae6c75ff49e884c79469249e70953258854b64fa8445c585ad45dc6dc6975501c6af7cff7074202c687f8a7bf1a3ac192689755f232275b4c8421b1a5669e9b904c29a292cdf961b783a7c0b4ce736900de4d8c63c5f85a65cb44af34bef840acef84ab75f44c4c9137610b68107aff3bbdcc19119c7a927c115b7b9bfb27d85c500ee77d13ec5a97a3ae6bf51d3b70a5502e8416de7b5eb8e9feee376411ca35c8a7f3f597c7606578cf96a4715ce5a35cf48e39c0a1faa2dee22d74e681901216005db98e51080bb392a7b5ebdbfcf33e0f4f0193102cc40f79a9ef0a9557c5a62dd1ef800056946e8329f979ba0cc82510d0dc78c3cceffa66ee5de5e298987a9858bf5262171614e556f40687ce6912cbea6a5b44472cb3ff107ece69cbd0fda0db392a64a82be714077351d6384d6cea254ad3c21e45a87852dac39190865c449a647a4e39928dad7611b0d2074437d17e44c766f3e0a150852cde235d455271b91eca03d7ec91c910ca38540f6f7ab94fcbfa4c43a4dd0f064b6210037d9370b3ad702eb883dcbf7ae6d8fe6529164594692f00f9888c2e77d135e922585ad9ce1c16291b9ab3e4a98582b3edd209a100a005fe44fa2e4843bf1995991a8bfb5af0fd2c5e5749a4a96d8865f31cefb9368f6feacb61f2477f24ad332b6553201216006ce839de4d6a3ae02f25b4089531e6a3d2de556bd006bd30cf2d3408b977d18f1756dd4a1bc3c00db9002f0d8ef1af50fbaa6959decbec1cbe234cc6ef6270a03339090e0238f8ac9f8a18f44b8734c8f3b6123dd128ae48a0863b9a7f6d88302043681772c2b79f350c14bc9d7b18e578c795ca76925ce7bd2891d09aa37fe2ce1ea2ffe4c038fef22f66e28995c61090221e86a3368fb6d671aafc19001f4227f92f3671af6a60b3db1285a142f49c1f450b76feb9b1aef1a551e858e4b7302c6cf1ca7fac05b993ba375d8183f90c089fa8a3df31a443d2e0a8ef193067068fbfcca2cef234cf6d9c9b5884ef69705a71810a56651726ca3b7acdfaffdfab9b2844b4ea6872b43ff9b7da2e10a2e23a79130c3c4c70a8ad0a77eb2d51f160121600f872b898a4fd1b8ae73515f7d33cd7be1e971ce1896aabef2f8926e586c4248dc0db7fd7851402c14149dc3dc84f3830c346167c39e5323971ac340415f0a2eb054a9a8e0a5d503a2acfecebdd1df71aeeac3b38260480c699bc09934f0913e0ee5aaeabd57313285207eb89366b411286cf3f1c5e30eb7e355f55385308b91d5807284323ee89a9743c70676f4949504ced3ed41612cbfda06ad55200c1c77d3fb3700059befd64c44bc4a57cb567ec1481ee564cf6cd6cf1f2f4a2dee6db00c547c38400ab118dedae8afd5bab93b703f76a0991baa5d43fbb125194c06b5461f8c738a3c4278a3d98e5456aec0720883c0d28919537a36e2ffd5f731e742b6653557d154c164e068ef983b367ef626faaed46f4eadecbb12b7e55f23175d01216002c2ec378eb6ba17a9e81b8fd44263d699c34719492a4ecf1ee76a942bc22478fb7a9f94e2f15822630f2d616c32a3340387118e4b96e26d6e41dbaab9fe27ad608bd823a142f988f7da999cdeca08ab4afedb6b3da2d4db208cc0ba91bfd44e153bd73736b7df01341780aaa7f185fca0d3a478dfb53b612ed91f054416de7bd62c59d39b4ee604ea96cb42f3d6aa20112197b4b9acf736e47fb44cf00cbe3725227d8aea5bca1efbbb894c1cbb566a7ab1b701e81dafd5b9f3077ce4f8b2f8000a047fb88dc5dcf8afee7658df0f985333a31516fba62200760fe4256c0260b199949737fb88f77d75c35dea4349261213ee6bebbff350204aff7cd8461651bed57cb455184b90abf56a1bb23deffea9bb25daec5cd2be9d7ce010719b9d5a012160137e0965267913f9eaf85bff22e3ce5f44bb1bfaed7679b1680acd15436a84325eba7f2962ca46937ccbf46d99edc944034cdd97bc4fb1d8dc3addb9c348431a99975959e6ac8238376af31f03e754fa3c315927cd6860265ec8e6e97da40a9509327773e7aa5bcfaef7690d769063336f6d5210a7de55e0ebf251ffd53f6dca022267fbc3ffc08e4709e3414a96b804056dd7e7ffc38927d8a3d8a5c0f46a8e737d638e89ef5c96fc5dfe79a21da0a2b5cbd0c1bb2e95ca9bbff1d416585c2c0119b676dc053c5abb3b0b4d60eafa065715a2c301a8d58bac871df836dfc0eb8d4ede191cab4cf6655451a37c9cf376082a65d5f23b818c185c56b16ce980b6fe0d68838fde6778fcc652cf6813fefd21db3727454df59ad3be7465d60507aa0121600478d126ce394ef52d6ffc6845672dfcedb14d4cabe76acd9efff25892b31dc32d8bd21426575f08a30b1b84bb8c1f6507810e25d47852f1f2a06b66b5341d02d7481a1cce01257e768aa1a59b683a28f6f7946674541f0f4e23643d31dfd7e90958a361c7db86b628fe075d94c85e2c43f858d3f3683d5369a87f76b3902c0765ddc8c904e375b0f5740db5d2e25f1b159a966e20596b1a38ff311b5365d7709cc679991307d692152cff49876663f315e081f4c0bc85c38a66f2198d5390170c275e23e9843ea74a046b3e7084aaa1d53c6fc6c8622250dcb812d444c341a8470df4b2c2ec3ab0d4aa563b101a31520d71df0c9c1eec4818cbaecb324ac2b9045aeb316bb1f4c6c9aac9247f1ec3fb824247f3858d1b9c6031413a11a7b059
KeysetHash: 0xf8bb9a67839d1767e79afe52d21e97a04ee0bf5f816d5b52c10df60cccb7f822
```

### Example with single private key = zero

For example, in the case of a solitary, zero-valued private key, the setup of the keys, Keyset, and <a data-quicklook-from="sequencer">Sequencer</a> configuration can be set as detailed below.

#### Key

```shell
cat /tmp/orbit-bls/das_bls  # this is an empty file, the private key is zero
cat /tmp/orbit-bls/das_bls.pub
YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==
```

#### Keyset

Once you've generated the keys, generating the Keyset as previously outlined is imperative. For example, in the scenario involving a zero-valued private key, the Keyset configuration would be as follows:

```shell
Keyset: 0x00000000000000010000000000000001012160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
KeysetHash: 0x4d795e20d33eea0b070600e4e100c512a750562bf03c300c99444bd5af92d9b0
```

Upon successfully generating the Keyset, it is essential to establish it within the parent chain. This step ensures that the parent chain is accurately informed of the Committee members' Keyset.

The Keyset can be configured by invoking the [setValidKeyset](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/bridge/SequencerInbox.sol#L466) method within the SequencerInbox contract.

**Note:** Only Rollup owner(s) can call this method to set the new valid Keyset.

#### Sequencer Configuration

It is necessary to modify the node configuration file associated with the node intended to initiate your chain. To incorporate the Committee keys into this node configuration, the following segment must be appended to the `JSON` file:

```shell
{
...
  "data-availability": {
    "enable": true,
    "rpc-aggregator": {
			"enable": true,
			"assumed-honest": 1,
      "backends": "[{"url":"http://localhost:9876","pubkey":"YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="}]"
    }
  }
...
}
```
