---
title: "Enable fast withdrawals"
description: "Learn to deploy Fast Withdrawals"
author: coopermidroni
sidebar_position: 
content_type: how-to
---

## Enable Fast Withdrawals on your Orbit chain
Fast Withdrawals is a feature allowing Orbit chains to achieve configurable, fast finality. With Fast Withdrawals, Orbit chains can achieve a finality time as low as 15 minutes. This is accomplished through the addition of a new `AnyTrustFastConfirmer` role set on the rollup contract, which is an address that has the permissions to confirm new state assertions. This role will be set to a committee or multisig of validators ("the Fast Withdrawals Committee") that unanimously votes to confirm new state transitions at the defined Fast Withdrawals frequency.  

### Recommended for AnyTrust only
While any Orbit chain can adopt Fast Withdrawals, we only recommend Fast Withdrawals for AnyTrust chains. This is because AnyTrust chains are able to leverage the existing trust assumption placed in their Data Availability Committee (DAC), which is that DAC nodes continue to uphold the data availability assumption. 

An ideal set up would establish these same operators as the validator committee for Fast Withdrawals, which provides the benefits of fast finality without expanding the trust assumption of the chain. 

### Benefits of Fast Withdrawals

## Implementation
### Requirements
- [Nitro 3.1.2](https://github.com/OffchainLabs/nitro/releases/tag/v3.1.2) or higher
- [nitro-contracts](https://github.com/OffchainLabs/nitro-contracts/releases/tag/v2.1.0) v2.1.0 or higher
- [ArbOS 20](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos20) or higher
- WASM module root: `0x260f5fa5c3176a856893642e149cf128b5a8de9f828afec8d11184415dd8dc69`


