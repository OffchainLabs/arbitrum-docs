---
title: 'Venly Tools <> Arbitrum'
description: 'Venly Tools stand on three pillars: Digital Wallets, Digital Assets, and Payments'
author: Abdullah Baig
sme: abdullahvenly
sidebar_label: 'Venly'
---

## [Venly](https://venly.io/)

Venly stands out as a cutting-edge developer platform, designed to streamline digital asset management and foster the creation of innovative blockchain solutions. Known for its exceptional performance and strong security features, Venly’s non-custodian model ensures you retain complete ownership and control of your assets, distinguishing it from other platforms.

At Venly, the core principles guide their commitment to you:

- **Security First**: Venly prioritizes the highest level of security for your assets and operations.
- **Developer-Centric**: Venly's intuitive tools and resources are designed to empower developers to achieve success.
- **Optimal Performance**: Venly guarantees consistent high performance with a focus on efficiency and reliability.
- **Innovation**: They are dedicated to providing cutting-edge solutions, staying at the forefront of technology.

The [Venly](https://venly.io/) platform is anchored by three main pillars: **Digital Wallets, Digital Assets, and Payments**, each seamlessly integrated to enhance your blockchain experience.

```
Venly Tools
│
├── Digital Wallets: Secure & scalable SSS-based wallets.
│
├── Digital Assets: API solutions for digital assets.
│
├── Payments: Customizable payment forms for fiat.
│
├── Gaming SDK:
│    │
│    ├── Unity: C# SDK
│    │
│    └── Unreal Engine: C++ SDK
│
└── Integrations:
    │
    ├── Zapier: no-code NFT minting with zaps.
    │
    ├── Shopify: Selling NFTs made easy.
    │
    └── SiteManager: Create mint pages in minutes, all no-code.
```

### [Digital Wallets](https://docs.venly.io/docs/wallet-api-overview)

Secure and scalable SSS-based wallets with robust key management custody digital assets. The Venly security protocol redefines private key security, never gathering a private key as one whole, eliminating risk. Venly customers use their wallets for a range of operations, such as treasury, trading, cold storage, royalties, NFTs, smart contracts, user wallets, and other digital assets.

### [Digital Assets](https://docs.venly.io/docs/nft-api-overview)

Robust tokenization is based on industry standards and is secured by several code and security audits. The Venly platform facilitates no-code and API solutions to manage, transfer, and gather information on different token asset classes, such as ERC20, ERC721, and ERC1155, which customers use in industries such as Finance, E-commerce, and Gaming.

### [Payments](https://docs.venly.io/docs/pay-api-overview)

With PAY, the Venly platform offers a low-code payment integration that creates a customizable form for collecting payments. You can embed Pay directly on your website or redirect customers to a hosted payment page. It offers a wide range of payment methods, from credit cards to PayPal, Apple Pay, Google Pay, instant bank transfers, and more, enabling customers to choose their preferred option.

## Product Specific Documentation

| Category        | Product                         | Documentation                                                                  |
| :-------------- | :------------------------------ | :----------------------------------------------------------------------------- |
| Digital Wallets | Widget                          | [API Reference](https://venly.readme.io/docs/product-overview)                 |
| Digital Wallets | Wallet API                      | [API Reference](https://venly.readme.io/reference/viewwallet)                  |
| Digital Assets  | NFT API                         | [API Reference](https://docs.venly.io/reference/getcontracts-1)                |
| Digital Assets  | Shopify NFT Minting Application | [App Store](https://apps.shopify.com/partners/arkane-network1)                 |
| Digital Assets  | Zapier Integration              | [Documentation](https://docs.venly.io/docs/zapier-integration)                 |
| Digital Assets  | SiteManager                     | [Documentation](https://docs.venly.io/docs/sitemanager)                        |
| Payments        | Venly PAY                       | [API Reference](https://docs.venly.io/docs/pay-api-overview)                   |
| Gaming SDK      | Unity                           | [Documentation](https://docs.venly.io/docs/getting-started-with-unity)         |
| Gaming SDK      | Unreal Engine                   | [Documentation](https://docs.venly.io/docs/getting-started-with-unreal-engine) |

# [Venly](https://venly.io/) - Arbitrum

Venly supports the Arbitrum chain on its Wallet API which allows you to create wallets on the Arbitrum chain. You can send and receive funds to/from Arbitrum wallets directly through the Wallet API, enabling seamless integration with applications using the Arbitrum blockchain.

# Wallet API

The Wallet API allows developers to interact with blockchain networks and offer wallet functionality to their users without having to build everything from scratch. This can include features like account creation, transaction management, balance inquiries, and more.

- Welcome your users with custom wallet branding. You can customize the user interface to your requirements.
- You are completely in charge of the wallet user experience to optimize user conversion. Get total freedom with regard to UX and asset management with the Venly Wallet API.
- You and your users have complete control over digital assets without any third-party interference. Securely manage wallets with complete autonomy and privacy.
- In the event of loss of login credentials, you and your users can recover access to wallets with a security code or biometric verification.

## Key features

| Features                    | Description                                                                                                                                                     |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wallet management           | Developers can use the API to create, manage, and secure wallets for their users.                                                                               |
| Transaction services        | The API can enable the initiation and monitoring of blockchain transactions.                                                                                    |
| Token support               | It may allow the handling of various tokens and assets on supported blockchain networks.                                                                        |
| Blockchain interactions     | Developers can integrate functionalities like reading data from the blockchain or writing data to it, along with creating and interacting with smart contracts. |
| Security features           | The API might offer features to enhance the security of user funds and transactions.                                                                            |
| User experience enhancement | It can contribute to a smoother and more user-friendly interaction with blockchain applications.                                                                |
| Multi-blockchain support    | Venly supports multiple blockchain networks, allowing developers to offer wallets for different cryptocurrencies.                                               |

## Creating an Arbitrum wallet

### Prerequisites

1. You need a Venly business account. If you don't have one, click to register [Developer Portal](https://portal.venly.io), or follow the [Getting Started with Venly](https://venly.readme.io/docs/getting-started) guide.

2. You need your client ID and client secret which can be obtained from the [Portal](https://portal.venly.io/).

3. You need a bearer token to authenticate API calls. Click [here](https://docs.venly.io/docs/authentication) to read how to authenticate.

### Request Endpoint: [reference](https://docs.venly.io/reference/createwallet)

```https
POST /api/wallets
```

#### Header params

| Parameter        | Param type | Value      | Description                                                                                   |
| :--------------- | :--------- | :--------- | :-------------------------------------------------------------------------------------------- |
| `Signing-Method` | Header     | `id:value` | `id`: This is the ID of the signing method. `value`: This is the value of the signing method. |

#### Body params

| Parameter    | Param type | Description                                            | Data type | Mandatory |
| :----------- | :--------- | :----------------------------------------------------- | :-------- | :-------- |
| `secretType` | Body       | The blockchain on which to create the wallet           | String    | ✅        |
| `userId`     | Body       | The ID of the user who you want to link this wallet to | String    | ❌        |

### Request body

```json
{
  "secretType": "ARBITRUM",
  "userId": "9cf9228e-1f2b-4940-9508-4335064cbc76"
}
```

### Response body

> Wallet created! The wallet has been created and linked to the specified user (`userId`).

```json
{
  "success": true,
  "result": {
    "id": "590f7276-2886-475c-a2d6-a28421f8f367",
    "address": "0xADc25e8A385213Fd820bc17Aa799076688f9fBd5",
    "walletType": "API_WALLET",
    "secretType": "ARBITRUM",
    "createdAt": "2024-06-05T11:19:12.038340492",
    "archived": false,
    "description": "Elegant Moose",
    "primary": false,
    "hasCustomPin": false,
    "userId": "9cf9228e-1f2b-4940-9508-4335064cbc76",
    "custodial": false,
    "balance": {
      "available": true,
      "secretType": "ARBITRUM",
      "balance": 0,
      "gasBalance": 0,
      "symbol": "ETH",
      "gasSymbol": "ETH",
      "rawBalance": "0",
      "rawGasBalance": "0",
      "decimals": 18
    }
  }
}
```

## Transferring Arbitrum Tokens

### Request Endpoint: [reference](https://docs.venly.io/reference/executetransaction_1)

```http
POST /api/transactions/execute
```

#### Header params

| Parameter        | Param type | Value      | Description                                                                                   |
| :--------------- | :--------- | :--------- | :-------------------------------------------------------------------------------------------- |
| `Signing-Method` | Header     | `id:value` | `id`: This is the ID of the signing method. `value`: This is the value of the signing method. |

#### Body params

| Parameter                       | Param Type | Description                                                        | Data Type | Mandatory |
| :------------------------------ | :--------- | :----------------------------------------------------------------- | :-------- | :-------- |
| `transactionRequest`            | Body       | This object includes the transaction information                   | Object    | ✅        |
| transactionRequest.`type`       | Body       | This will be **TRANSFER**                                          | String    | ✅        |
| transactionRequest.`walletId`   | Body       | The `id` of the wallet that will initiate the tx                   | String    | ✅        |
| transactionRequest.`to`         | Body       | Destination Address (can be a blockchain address or email address) | String    | ✅        |
| transactionRequest.`secretType` | Body       | On which blockchain the tx will be executed                        | String    | ✅        |
| transactionRequest.`value`      | Body       | The amount you want to transfer                                    | Integer   | ✅        |

### Request Body:

```json
{
  "transactionRequest": {
    "type": "TRANSFER",
    "walletId": "590f7276-2886-475c-a2d6-a28421f8f367",
    "to": "0x1588aCD59c9baF27C1b777eAa71A67d6b6024077",
    "value": "0.0005",
    "secretType": "ARBITRUM"
  }
}
```

### Response Body:

> The coins were successfully transferred!

```json
{
  "success": true,
  "result": {
    "id": "34d51bb3-c963-486d-856e-1e3f12638e3d",
    "transactionHash": "0x804d14bcda10628e61e7ae9085ecad63eafea09d3fdb3cb4ec8cb8dc312dc5b7"
  }
}
```

### Next Steps

> Ready to try it out? Click to read the [getting started guide for Wallet API.](https://docs.venly.io/docs/wallet-api-getting-started)
