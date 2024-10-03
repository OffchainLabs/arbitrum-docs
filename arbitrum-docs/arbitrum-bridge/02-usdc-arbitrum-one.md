---
title: 'USDC on Arbitrum One'
description: 'Learn about the two different types of USDC supported by Arbitrum One: Arbitrum-Native USDC and Bridged (from Ethereum) USDC'
author: amarrazza
user_story: As a user of the Arbitrum Bridge, I want to understand the differences between Arbitrum-native USDC and Bridged USDC.
content_type: concept
sidebar_position: 4
---

Arbitrum One supports two different types of USDC:

1.  **Arbitrum-native USDC (USDC)**: USDC tokens native to the Arbitrum One chain.
2.  **Bridged USDC (USDC.e)**: Ethereum-native USDC tokens that have been bridged to Arbitrum One.

### Differences between USDC and USDC.e

<table className="small-table">
  <tr>
    <th></th>
    <th>Arbitrum-native USDC</th>
    <th>Bridged USDC</th>
  </tr>
  <tr>
    <td>Token Name</td>
    <td>USD Coin</td>
    <td>Bridged USDC</td>
  </tr>
  <tr>
    <td>Token Symbol</td>
    <td>USDC</td>
    <td>USDC.e</td>
  </tr>
  <tr>
    <td>Token Address</td>
    <td>
      <a href="https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831">
        0xaf88d065e77c8cC2239327C5EDb3A432268e5831
      </a>
    </td>
    <td>
      <a href="https://arbiscan.io/token/0xff970a61a04b1ca14834a43f5de4533ebddb5cc8">
        0xff970a61a04b1ca14834a43f5de4533ebddb5cc8
      </a>
    </td>
  </tr>
  <tr>
    <td>Benefits</td>
    <td>CEX Support, directly redeemable 1:1 for U.S dollars</td>
    <td></td>
  </tr>
</table>

The Arbitrum Bridge will continue to facilitate transfers of all USDC tokens. When depositing Ethereum-native USDC, the option exists to receive Bridged USDC using Arbitrum's bridge or Arbitrum-native USDC using Circle’s [Cross-Chain Transfer Protocol](https://www.circle.com/en/cross-chain-transfer-protocol).

### Historical context

Arbitrum One has supported Bridged USDC since conception, which previously had over a billion Bridged USDC in circulation. On June 8th 2023, Circle added support for the Cross-Chain Transfer Protocol and launched Arbitrum-native USDC, which enabled direct minting and burning of Arbitrum-Native USDC on Arbitrum One. Due to this, the Bridged USDC token symbol was renamed from USDC to USDC.e to accommodate Arbitrum-native USDC. The expectation is that over time the conversion of Bridged USDC to Arbitrum-native USDC will continue.
