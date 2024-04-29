---
title: 'ETH bridging'
description: Describes how bridging ether works on Arbitrum
author: dzgoldman
user_story: As a developer, I want to understand how bridging ether works on Arbitrum
content_type: concept
sidebar_position: 2
---

import DepositEthDiagram from '../../diagrams/_deposit-eth.mdx';
import WithdrawEthDiagram from '../../diagrams/_withdraw-eth.mdx';

Ether (ETH) is the native currency of Ethereum and all Arbitrum chains. It is used to pay the necessary fees to execute a transaction in those chains. Bridging ETH from Ethereum (Layer 1, or L1) to an Arbitrum chain (Layer 2, or L2) follows, thus, a different process than the one followed when bridging other types of asset.

## Depositing ether

To move ETH from L1 to L2, you execute a deposit transaction via `Inbox.depositEth`. This transfers funds to the Bridge contract on the L1 and credits the same funds to you inside the Arbitrum chain at the specified address.

```sol
function depositEth(address destAddr) external payable override returns (uint256)
```

The following diagram depicts the process that funds follow during a deposit operation.

<DepositEthDiagram />

As far as the L1 knows, all deposited funds are held by Arbitrum's Bridge contract.

## Withdrawing ether

Withdrawing ether can be done using the [ArbSys precompile](/build-decentralized-apps/precompiles/02-reference.md#arbsys)'s `withdrawEth` method:

```sol
ArbSys(100).withdrawEth{ value: 2300000 }(destAddress)
```

Upon withdrawing, the Ether balance is burnt on the Arbitrum side, and will later be made available on the Ethereum side.

`ArbSys.withdrawEth` is actually a convenience function which is equivalent to calling `ArbSys.sendTxToL1` with empty calldataForL1. Like any other `sendTxToL1` call, it will require an additional call to `Outbox.executeTransaction` on L1 after the dispute period elapses for the user to finalize claiming their funds on L1 (see ["L2 to L1 Messages"](/how-arbitrum-works/arbos/l2-l1-messaging.md)). Once the withdrawal is executed from the Outbox, the user's Ether balance will be credited on L1.

The following diagram depicts the process that funds follow during a withdraw operation.

<WithdrawEthDiagram />
