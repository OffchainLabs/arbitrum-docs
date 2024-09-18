---
title: How to adopt the bridged USDC standard on your Orbit chain
description: How to implement Circle bridged USDC standard on Orbit chain
author: shughesocl
sidebar_position: 5
content_type: how-to
---

Circle’s [Bridged USDC Standard](https://www.circle.com/blog/bridged-usdc-standard) is a specification and process for deploying a bridged form of USDC on EVM blockchains with optionality for Circle to seamlessly upgrade to native issuance in the future.

## Why adopt the bridged USDC standard?

When USDC is bridged into an Orbit chain, the default path is to use the chain’s [canonical gateway contracts for ERC-20s](/build-decentralized-apps/token-bridging/token-bridge-erc20). By way of example, when a user bridges USDC from Arbitrum One to an Orbit chain, their Arbitrum One USDC tokens are locked into the Orbit chain’s parent side bridge, and a representative USDC token is minted to the user’s address on the Orbit chain, via the child side bridge. 

The challenge with this user flow is twofold.

1. **Native vs. non-Native USDC:** The USDC tokens issued by Circle (’native USDC’) are locked in the parent side bridge contract. Conversely, the USDC tokens on the Orbit chain aren’t native USDC but are collateralized by the locked tokens in the bridge. As such, Circle will not recognize these tokens across their product suite.  
2. **Fragmented UX:** If Circle were to provide native support for USDC by deploying a USDC contract on the Orbit chain, there would be two forms of USDC on the chain (native and non-native USDC). This leads to a fragmented user experience, and users with non-native USDC would have to withdraw to the parent chain to be able to turn their tokens into native USDC. 

By deploying the bridged USDC standard from the start, all USDC tokens that are bridged are locked in a gateway contract that can be adopted by Circle should a chain upgrade its USDC into native USDC. This allows USDC adoption on Orbit chains today without encountering either of the two problems above. 

## How to implement the bridged USDC Standard

We provide a custom USDC gateway implementation (for parent and child chain) that follows the Bridged USDC Standard. These contracts can be used by new Orbit chains. This solution will NOT be used in existing Arbitrum chains that are governed by the DAO. 

- On a parent chain the contract `L1USDCGateway` is used in case the child chain uses ETH as native currency, or `L1OrbitUSDCGateway` in case the child chain uses a custom fee token.
- On a child chain, `L2USDCGateway` is used.
- For the USDC token contracts, Circle's reference [implementation](https://github.com/circlefin/stablecoin-evm/blob/master/doc/bridged_USDC_standard.md) is used.

This page describes how to deploy a USDC bridge compatible with both the Orbit token bridge and Circle’s Bridged USDC Standard.

 Steps for a transition to native USDC issuance are also provided. Note that both Circle and the Orbit chain owner must agree to transition to native USDC issuance.

## Requirements

- Recommended token bridge version 1.2.0
- No additional dependencies with Nitro or Nitro contract version

Other requirements:

- It is assumed there is already USDC token deployed and used on the parent chain.
- Also, it is assumed the standard Orbit chain ownership system is used, ie. UpgradeExecutor is the owner of the ownable contracts and there is an EOA or multisig which has the executor role on the UpgradeExecutor.
- Refer to the [token bridge overview page](https://github.com/OffchainLabs/arbitrum-docs/blob/master/arbitrum-docs/launch-orbit-chain/how-tos/orbit-sdk-deploying-token-bridge.md) for more information about the token bridge design and operational dynamics. More information about gateways can be found [here](https://docs.arbitrum.io/build-decentralized-apps/token-bridging/token-bridge-erc20#other-flavors-of-gateways).

## Deployment Steps

<aside>

Throughout the docs and code, terms `L1` and `L2` are used interchangeably with `parent chain` and `child chain`. They have the same meaning, ie. if an Orbit chain is deployed on top of ArbitrumOne then ArbitrumOne is `L1`/`parent chain`, while Orbit is `L2`/`child chain`. 

The usdc-bridge-deployment script and readme can be found [here](https://github.com/OffchainLabs/token-bridge-contracts/tree/v1.2.3/scripts/usdc-bridge-deployment). 

</aside>

Checkout target code, install dependencies and build

```solidity
cd token-bridge-contracts
yarn install
yarn build
```

Populate .env based on env.example in this directory

```solidity
PARENT_RPC=
PARENT_DEPLOYER_KEY=
CHILD_RPC=
CHILD_DEPLOYER_KEY=
L1_ROUTER=
L2_ROUTER=
INBOX=
L1_USDC=
## OPTIONAL arg. If set, script will register the gateway, otherwise it will store TX payload in a file
ROLLUP_OWNER_KEY=
```

Run the script

```solidity
yarn deploy:usdc-token-bridge
```

The script will do the following:

- load deployer wallets for L1 and L2
- register L1 and L2 networks in SDK
- deploy new L1 and L2 proxy admins
- deploy bridged (L2) USDC using the Circle's implementation
- init L2 USDC
- deploy L1 USDC gateway
- deploy L2 USDC gateway
- init both gateways
- if `ROLLUP_OWNER_KEY` is provided, register the gateway in the router through the UpgradeExecutor
- if `ROLLUP_OWNER_KEY` is not provided, prepare calldata and store it in `registerUsdcGatewayTx.json` file
- set minter role to L2 USDC gateway with max allowance

Now new USDC gateways can be used to deposit/withdraw USDC. Everything is now in place to support transition to native USDC issuance, if Circle and the Orbit chain owner agree to it. 

## Transitioning to Native USDC

Once a transition to native USDC is agreed upon, the following steps are required:

- L1 gateway owner pauses deposits on parent chain by calling `pauseDeposits()`
- L2 gateway owner pauses withdrawals on child chain by calling `pauseWithdrawals()`
- master minter removes the minter role from the child chain gateway
    - NOTE: there should be no in-flight deposits when minter role is revoked. If there are any, they should be finalized first. That can be done by anyone by claiming the claimable failed retryable tickets which do the USDC depositing
- L1 gateway owner sets Circle's account as burner on the parent chain gateway using `setBurner(address)`
- L1 gateway owner reads the total supply of USDC on the child chain, and then invokes `setBurnAmount(uint256)` on the parent child gateway where the amount matches the total supply
- USDC masterMinter gives minter role with 0 allowance to L1 gateway, so the burn can be executed
- on the child chain, L2 gateway owner calls the `setUsdcOwnershipTransferrer(address)` to set the account (provided and controlled by Circle) which will be able to transfer the bridged USDC ownership and proxy admin
- if not already owned by gateway, L2 USDC owner transfers ownership to gateway, and proxy admin transfers admin rights to gateway
- Circle uses `usdcOwnershipTransferrer` account to trigger `transferUSDCRoles(address)` which will set caller as USDC proxy admin and will transfer USDC ownership to the provided address
- Circle calls `burnLockedUSDC()` on the L1 gateway using `burner` account to burn the `burnAmount` of USDC
    - remaining USDC will be cleared off when remaining in-flight USDC withdrawals are executed, if any
    - L1 gateway owner is trusted to not frontrun this TX to modify the burning amount
