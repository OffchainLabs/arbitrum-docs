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
    <th>USDC</th>
    <th>Bridged USDC</th>
  </tr>
  <tr>
    <td>Token Name</td>
    <td>USDC</td>
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

The Arbitrum Bridge will continue to facilitate transfers of all USDC tokens. When depositing USDC from Ethereum, the option exists to receive USDC using Circle’s Cross-Chain Transfer Protocol or receive Bridged USDC using Arbitrum’s lock-and-mint bridge.
Historical context
In 2023, Circle launched USDC natively on Arbitrum One and added support for Cross-Chain Transfer Protocol, which enabled direct minting and burning of USDC between Ethereum and Arbitrum One. Due to this, the token symbol for Bridged USDC was renamed to USDC.e to accommodate an ecosystem-wide liquidity migration to native USDC. The expectation is that over time the liquidity migration of USDC.e to USDC will continue.
