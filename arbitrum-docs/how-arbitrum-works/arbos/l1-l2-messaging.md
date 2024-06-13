---
title: 'L1 to L2 messaging'
description: This concept page provides information about how arbitrary messages are passed from L1 to L2
target_audience: developers who want to build on Arbitrum
content_type: concept
---

import { AddressAliasHelper } from '@site/src/components/AddressAliasHelper';
import {
  MermaidWithHtml,
  Nodes,
  Node,
  Connection,
  NodeDescriptions,
  NodeDescription,
} from '/src/components/MermaidWithHtml/MermaidWithHtml';

## Retryable Tickets

Retryable tickets are Arbitrum's canonical method for creating L1 to L2 messages, i.e., L1 transactions that initiate a message to be executed on L2. A retryable can be submitted for a fixed cost (dependent only on its calldata size) paid at L1; its _submission_ on L1 is separable / asynchronous with its _execution_ on L2. Retryables provide atomicity between the cross chain operations; if the L1 transaction to request submission succeeds (i.e. does not revert) then the execution of the Retryable on L2 has a strong guarantee to ultimately succeed as well.

## Retryable Tickets Lifecycle

Here we walk through the different stages of the lifecycle of a retryable ticket; (1) submission, (2) auto-redemption, and (3) manual redemption.

### Submission

1. Creating a retryable ticket is initiated with a call (direct or internal) to the `createRetryableTicket` function of the [`inbox` contract][inbox_link]. A ticket is guaranteed to be created if this call succeeds. Here, we describe parameters that need to be carefully set. Note that, this function forces the sender to provide a _reasonable_ amount of funds (at least enough to submitting, and _attempting_ to executing the ticket), but that doesn't guarantee a successful auto-redemption.

| Parameter                                   | Description                                                                                                                                                                                                                                                                                                    |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1CallValue (also referred to as deposit)` | Not a real function parameter, it is rather the callValue that is sent along with the transaction                                                                                                                                                                                                              |
| `address to`                                | The destination L2 address                                                                                                                                                                                                                                                                                     |
| `uint256 l2CallValue`                       | The callvalue for retryable L2 message that is supplied within the deposit (l1CallValue)                                                                                                                                                                                                                       |
| `uint256 maxSubmissionCost`                 | The maximum amount of ETH to be paid for submitting the ticket. This amount is (1) supplied within the deposit (l1CallValue) to be later deducted from sender's L2 balance and is (2) directly proportional to the size of the retryable’s data and L1 basefee                                                 |
| `address excessFeeRefundAddress`            | The unused gas cost and submssion cost will deposit to this address, formula is: `(gasLimit x maxFeePerGas - execution cost) + (maxSubmission - (autoredeem ? 0 : submission cost))`. (Note: excess deposit will transfer to the alias address of the parent chain tx's `msg.sender` rather than this address) |
| `address callValueRefundAddress`            | The L2 address to which the l2CallValue is credited if the ticket times out or gets cancelled (this is also called the `beneficiary`, who's got a critical permission to cancel the ticket)                                                                                                                    |
| `uint256 gasLimit`                          | Maximum amount of gas used to cover L2 execution of the ticket                                                                                                                                                                                                                                                 |
| `uint256 maxFeePerGas`                      | The gas price bid for L2 execution of the ticket that is supplied within the deposit (l1CallValue)                                                                                                                                                                                                             |
| `bytes calldata data`                       | The calldata to the destination L2 address                                                                                                                                                                                                                                                                     |

2. Sender's deposit must be enough to make the L1 submission succeed and for the L2 execution to be _attempted_. If provided correctly, a new ticket with a unique `TicketID` is created and added to retryable buffer. Also, funds (`submissionCost` + `l2CallValue`) are deducted from the sender and placed into the escrow for later use in redeeming the ticket.

3. Ticket creation causes the [`ArbRetryableTx`](/build-decentralized-apps/precompiles/02-reference.md#arbretryabletx) precompile to emit a `TicketCreated` event containing the `TicketID` on L2.

[inbox_link]: https://github.com/OffchainLabs/nitro-contracts/blob/67127e2c2fd0943d9d87a05915d77b1f220906aa/src/bridge/Inbox.sol

<MermaidWithHtml>
  <Nodes title="Ticket Submission">
    <Node id="1">🧍</Node>
    <Node id="2">Initiating an L1-L2 message</Node>
    <Node id="3">Enough deposit?</Node>
    <Node id="4">Ticket creation fails</Node>
    <Node id="5">Ticket is created</Node>
    <Connection from="1" to="2" />
    <Connection from="2" to="3" />
    <Connection from="3" to="4" label="no" />
    <Connection from="3" to="5" label="yes" />
  </Nodes>
  <NodeDescriptions>
    <NodeDescription for="1">
      <code>🧍</code> The user who initiates an L1-L2 message
    </NodeDescription>
    <NodeDescription for="2">
      <code>Initiating an L1-L2 message</code> A call to `inbox.createRetryableTicket` function that
      puts the message in the L2 inbox that can be re-executed for some fixed amount of time if it
      reverts
    </NodeDescription>
    <NodeDescription for="3">
      <code>Check user's deposit</code> Logic that checks if the user have enough funds to create a
      ticket. This is done by checking if the `msg.value` provided by the user is greater than or
      equal to <code>maxSubmissionCost + l2CallValue + gasLimit * maxFeePerGas</code>
    </NodeDescription>
    <NodeDescription for="4">
      <code>Ticket creation fails</code> Ticket creation fails and no funds are deducted from the
      user
    </NodeDescription>
    <NodeDescription for="5">
      <code>Ticket is created</code> A ticket is created and added to the retryable buffer on L2
      Funds (<code>l2CallValue + submissionCost</code>) are deducted to cover the callvalue from the
      user and placed into escrow (on L2) for later use in redeeming the ticket
    </NodeDescription>
  </NodeDescriptions>
</MermaidWithHtml>

### Automatic Redemption

4. It is very important to note that the submission of a ticket on L1 is separable / asynchronous from its execution on L2, i.e., a successful L1 ticket creation does not guarantee a successful redemption. Once the ticket is successfully created, the two following conditions are checked: (1) if the user's L2 balance is greater than (or equal to) `maxFeePerGas * gasLimit` **and** (2) if the `maxFeePerGas` (provided by the user in the ticket submission process) is greater than (or equal to) the `l2Basefee`. If these conditions are both met, ticket's submission is followed by an attempt to execute it on L2 (i.e., an **auto-redeem** using the supplied gas, as if the `redeem` method of the [ArbRetryableTx](/build-decentralized-apps/precompiles/02-reference.md#arbretryabletx) precompile had been called). Depending on how much gas the sender has provided in step 1, ticket's redemption can either (1) immediately succeed or (2) fail. We explain both situations here:

- If the ticket is successfully auto-redeemed, it will execute with the sender, destination, callvalue, and calldata of the original submission. The submission fee is refunded to the user on L2 (`excessFeeRefundAddress`). Note that to ensure successful auto-redeem of the ticket, one could use the Arbitrum SDK which provides a [convenience function](https://github.com/OffchainLabs/arbitrum-sdk/blob/4cedb1fcf1c7302a4c3d0f8e75fb33d82bc8338d/src/lib/message/L1ToL2MessageGasEstimator.ts#L215) that returns the desired gas parameters when sending L1-L2 messages.

- If a redeem is not done at submission or the submission's initial redeem fails (for example, because the L2 gas price has increased unexpectedly), the submission fee is collected on L2 to cover the resources required to temporarily keep the ticket in memory for a fixed period (one week), and only in this case, a manual redemption of the ticket is required (see next section).

<MermaidWithHtml>
  <Nodes title="Automatic Redemption of the Ticket">
    <Node id="1">Auto-redeem succeeds?</Node>
    <Node id="2">Ticket is executed</Node>
    <Node id="3">Ticket is deleted</Node>
    <Node id="4">callValueRefundAddress gets refunded</Node>
    <Connection from="1" to="2" label="yes" />
    <Connection from="2" to="3" />
    <Connection from="1" to="4" label="no" />
  </Nodes>
  <NodeDescriptions>
    <NodeDescription for="1">
      <code>Does the auto-redeem succeed?</code> Logic that determines if the user's L2 Balance is
      greater than (or equal to) <code>maxFeePerGas * gasLimit</code> && <code>maxFeePerGas</code>{' '}
      is greater than (or equal to) the <code>l2Basefee</code>
    </NodeDescription>
    <NodeDescription for="2">
      <code>Ticket is executed</code> Ticket is executed, the actual <code>submissionFee</code> is
      refunded to the <code>excessFeeRefundAddress</code> since the ticket was not kept in the
      buffer on L2
    </NodeDescription>
    <NodeDescription for="3">
      <code>Ticket is deleted</code> Ticket gets deleted from the L2 retryable buffer
    </NodeDescription>
    <NodeDescription for="4">
      <code>callValueRefundAddress gets refunded</code> <code>callValueRefundAddress</code> gets
      refunded with <code>(maxGas - gasUsed) * gasPrice</code>. Note that this amount is capped by{' '}
      <code>l1CallValue</code> in the auto-redeem
    </NodeDescription>
  </NodeDescriptions>
</MermaidWithHtml>

### Manual Redemption

5. At this point, _anyone_ can attempt to manually redeem the ticket again by calling [ArbRetryableTx](/build-decentralized-apps/precompiles/02-reference.md#arbretryabletx)'s `redeem` precompile method, which donates the call's gas to the next attempt. Note that the amount of gas is NOT limited by the original gasLimit set during the ticket creation. ArbOS will [enqueue the redeem][enqueue_link], which is its own special `ArbitrumRetryTx` type, to its list of redeems that ArbOS [guarantees to exhaust][exhaust_link] before moving on to the next non-redeem transaction in the block its forming. In this manner redeems are scheduled to happen as soon as possible, and will always be in the same block as the tx that scheduled it. Note that the redeem attempt's gas comes from the call to redeem, so there's no chance the block's gas limit is reached before execution.

6. If the fixed period (one week) elapses without a successful redeem, the ticket **expires** and will be [automatically **discarded**][discard_link], unless some party has paid a fee to [**keep the ticket alive**][renew_link] for another full period. A ticket can live indefinitely as long as it is renewed each time before it expires.

[enqueue_link]: https://github.com/OffchainLabs/nitro/blob/fa36a0f138b8a7e684194f9840315d80c390f324/arbos/block_processor.go#L245
[exhaust_link]: https://github.com/OffchainLabs/nitro/blob/fa36a0f138b8a7e684194f9840315d80c390f324/arbos/block_processor.go#L135
[discard_link]: https://github.com/OffchainLabs/nitro/blob/fa36a0f138b8a7e684194f9840315d80c390f324/arbos/retryables/retryable.go#L262
[renew_link]: https://github.com/OffchainLabs/nitro-contracts/blob/a68783436b5105a64f54efe5fbd55174704a7618/src/precompiles/ArbRetryableTx.sol#L41

<MermaidWithHtml>
  <Nodes title="Manual Redemption of the Ticket">
    <Node id="1">Ticket manually cancelled or not redeemed in 7 days?</Node>
    <Node id="2">callValueRefundAddress gets refunded</Node>
    <Node id="3">Ticket is deleted</Node>
    <Node id="4">Ticket manually redeemed?</Node>
    <Connection from="1" to="2" label="yes" />
    <Connection from="2" to="3" />
    <Connection from="1" to="4" label="no" />
    <Connection from="4" to="3" label="yes" />
    <Connection from="4" to="1" label="no" />
  </Nodes>
  <NodeDescriptions>
    <NodeDescription for="1">
      <code>Is the ticket manually cancelled or not redeemed within 7 days?</code> Logic that
      determines if the ticket is manually cancelled or not redeemed within 7 days (i.e., is
      expired)
    </NodeDescription>
    <NodeDescription for="2">
      <code>callValueRefundAddress gets refunded</code> callValueRefundAddress is refunded with the{' '}
      <code>l2CallValue</code>
    </NodeDescription>
    <NodeDescription for="3">
      <code>Ticket is deleted</code> Ticket gets deleted from the L2 retryable buffer
    </NodeDescription>
    <NodeDescription for="4">
      <code>Is the ticket manually redeemed</code> Logic that determines if the ticket is manually
      redeemed
    </NodeDescription>
  </NodeDescriptions>
</MermaidWithHtml>

:::caution Avoid Losing Funds!

If a ticket expires after 7 days without being redeemed or re-scheduled to a future date, any message and value (other than the escrowed `callvalue`) it carries could be lost without possibility of being recovered.

:::

On success, the `To` address receives the escrowed callvalue, and any unused gas is returned to ArbOS's gas pools. On failure, the callvalue is returned to the escrow for the future redeem attempt. In either case, the network fee was paid during the scheduling tx, so no fees are charged and no refunds are made.

Note that during redemption of a ticket, attempts to cancel the same ticket, or to schedule another redeem of the same ticket, will revert. In this manner retryable tickets are not self-modifying.

If a ticket with a callvalue is eventually discarded (cancelled or expired), having never successfully run, the escrowed callvalue will be paid out to a `callValueRefundAddress` account that was specified in the initial submission (step 1).

:::note Important Notes:

If a redeem is not done at submission or the submission's initial redeem fails, anyone can attempt to redeem the retryable again by calling [`ArbRetryableTx`](/build-decentralized-apps/precompiles/02-reference.md#arbretryabletx)'s `redeem` precompile method, which donates the call's gas to the next attempt. ArbOS will [enqueue the redeem][enqueue_link], which is its own special `ArbitrumRetryTx` type, to its list of redeems that ArbOS [guarantees to exhaust][exhaust_link] before moving on to the next non-redeem transaction in the block its forming. In this manner redeems are scheduled to happen as soon as possible, and will always be in the same block as the transaction that scheduled it. Note that the redeem attempt's gas comes from the call to `redeem`, so there's no chance the block's gas limit is reached before execution.

- One can redeem live tickets using the [Arbitrum Retryables Transaction Panel][retryable_dashboard_link]
- The calldata of a ticket is saved on L2 until it is redeemed or expired
- Redeeming cost of a ticket will not increase over time, it only depends on the current gas price and gas required for execution

:::

[retryable_dashboard_link]: https://retryable-dashboard.arbitrum.io/tx

### Receipts

In the lifecycle of a retryable ticket, two types of L2 transaction receipts will be emitted:

- **Ticket Creation Receipt**: This receipt indicates that a ticket was successfully created; any successful L1 call to the `Inbox`'s `createRetryableTicket` method is guaranteed to create a ticket. The ticket creation receipt includes a `TicketCreated` event (from `ArbRetryableTx`), which includes a `ticketId` field. This `ticketId` is computable via RLP encoding and hashing the transaction; see [calculateSubmitRetryableId](https://github.com/OffchainLabs/arbitrum-sdk/blob/6cc143a3bb019dc4c39c8bcc4aeac9f1a48acb01/src/lib/message/L1ToL2Message.ts#L109).
- **Redeem Attempt**: A redeem attempt receipt represents the result of an attempted L2 execution of a ticket, i.e, success / failure of that specific redeem attempt. It includes a `RedeemScheduled` event from `ArbRetryableTx`, with a `ticketId` field. At most, one successful redeem attempt can ever exist for a given ticket; if, e.g., the auto-redeem upon initial creation succeeds, only the receipt from the auto-redeem will ever get emitted for that ticket. If the auto-redeem fails (or was never attempted — i.e., the provided L2 gas limit \* L2 gas price = 0), each initial attempt will emit a redeem attempt receipt until one succeeds.

### Alternative "unsafe" Retryable Ticket Creation

The `Inbox.createRetryableTicket` convenience method includes sanity checks to help minimize the risk of user error: the method will ensure that enough funds are provided directly from L1 to cover the current cost of ticket creation. It also will convert the provided `callValueRefundAddress` and `excessFeeRefundAddress` to their address alias (see below) if either is a contract (determined by if the address has code during the call), providing a path for the L1 contract to recover funds. A power-user may bypass these sanity-check measures via the `Inbox`'s `unsafeCreateRetryableTicket` method; as the method's name desperately attempts to warn you, it should only be accessed by a user who truly knows what they're doing.

## Eth deposits

A special message type exists for simple Eth deposits; i.e., sending Eth from L1 to L2. Eth can be deposited via a call to the `Inbox`'s `depositEth` method. If the L1 caller is EOA, the Eth will be deposited to the same EOA address on L2; the L1 caller is a contract, the funds will deposited to the contract's aliased address (see below).

Note that depositing Eth via `depositEth` into a contract on L2 will _not_ trigger the contract's fallback function.

In principle, retryable tickets can alternatively be used to deposit Ether; this could be preferable to the special eth-deposit message type if, e.g., more flexibility for the destination address is needed, or if one wants to trigger the fallback function on the L2 side.

## Transacting via the Delayed Inbox

While retryables and Eth deposits _must_ be submitted through the delayed inbox, in principle, _any_ message can be included this way; this is a necessary recourse to ensure the Arbitrum chain preserves censorship resistance even if the Sequencer misbehaves (see [The Sequencer and Censorship Resistance](/how-arbitrum-works/sequencer.md)). However, under ordinary/happy circumstances, the expectation/recommendation is that clients use the delayed inbox only for Retryables and Eth deposits, and transact via the Sequencer for all other messages.

### Address Aliasing

Unsigned messages submitted via the Delayed Inbox get their sender's addressed "aliased": when these messages are executed on L2, the sender's address —i.e., that which is returned by `msg.sender` — will _not_ simply be the L1 address that sent the message; rather it will be the address's "L2 Alias." An address's L2 alias is its value increased by the hex value `0x1111000000000000000000000000000000001111`:

```sol
L2_Alias = L1_Contract_Address + 0x1111000000000000000000000000000000001111
```

:::tip Try it out

<AddressAliasHelper />
:::

The Arbitrum protocol's usage of L2 Aliases for L1-to-L2 messages prevents cross-chain exploits that would otherwise be possible if we simply reused the same L1 addresses as the L2 sender; i.e., tricking an L2 contract that expects a call from a given contract address by sending retryable ticket from the expected contract address on L1.

If for some reason you need to compute the L1 address from an L2 alias on chain, you can use our `AddressAliasHelper` library:

```sol
modifier onlyFromMyL1Contract() override {
    require(AddressAliasHelper.undoL1ToL2Alias(msg.sender) == myL1ContractAddress, "ONLY_COUNTERPART_CONTRACT");
    _;
}
```

### Signed Messages

The delayed inbox can also accept messages that include a signature. In this case, the message will execute with the `msg.sender` address equal to the address that produced the included signature (i.e., _not_ its alias). Intuitively, the signature proves that the sender address is not a contract, and thus is safe from cross-chain exploit concerns described above. Thus, it can safely execute from signer's address, similar to a transaction included in a Sequencer's batch. For these messages, the address of the L1 sender is effectively ignored at L2.

These signed messages submitted through the delayed inbox can be used to execute messages that bypass the Sequencer and require EOA authorization at L2, e.g., force-including an Ether withdrawal (see ["withdraw eth tutorial"](https://github.com/OffchainLabs/arbitrum-tutorials/blob/a1c3f64a5abdd0f0e728cb94d4ecc2700eab7579/packages/delayedInbox-l2msg/scripts/withdrawFunds.js#L61-L65)).
