# Orbit Chain Confirmation and Finality

## Child chain transactions

Generally, transactions executed through the sequencer on Orbit chains [achieve finality](/tx-lifecycle) equivalent to their parent chain once the relevant transaction data has been [posted in a batch](/sequencer). This means that transactions on Orbit chains are considered final in minutes.

## Parent Chain → Child Chain Transactions

Messages being sent through the delayed inbox of a parent chain as [retryable tickets](/arbos/l1-to-l2-messaging.mdx#retryable-tickets), including deposits through token bridges, are released by the [sequencer](/inside-arbitrum-nitro/inside-arbitrum-nitro.mdx#if-the-sequencer-is-well-behaved) once it has good confidence of finality on the parent chain. For example, on an L2 chain settling to Ethereum, the sequencer will release delayed messages to the inbox after 40 blocks. Following this, the transaction will need to complete another finality period for the Ethereum transaction that promoted it to achieve finality.

Orbit L3s may configure the finality of transactions executed through the delayed inbox to depend on different layers of finality. By default, Orbit chains will rely on the number of L1 block confirmations, effectively finalizing an L3 deposit as soon as L1 finalizes the batch posted by <a data-quicklook-from="arbitrum-one">Arbitrum One</a> or when a <a data-quicklook-from="data-availability-certificate">DACert</a> is posted by <a data-quicklook-from="arbitrum-nova">Arbitrum Nova</a>. This would be on the order of tens of minutes.


However, in the instance of an L3 settling to Arbitrum One or Nova an L3 may also choose to rely only on L2 finality by configuring their sequencer as follows:

```
--node.delayed-sequencer.use-merge-finality=false
```

Additionally, the delay in L3 finalization can be decreased to achieve extremely fast (<1 min) deposits by configuring the sequencer to wait for fewer L2 block confirmations:

```
--node.delayed-sequencer.finalize-distance=1
```

Note, however, that if you choose to enable fast bridging, a re-org of un-finalized blocks on the L3 may occur if Arbitrum One/Nova (or the settlement chain of choice) experiences a re-org.

## Child Chain → Parent Chain Transactions

Normally, [outgoing transactions](/arbos/l2-to-l1-messaging) must wait until the assertion that includes their L2 message is confirmed (~1 week) before a client can execute the message on L1. However, in the near future [Anytrust](/inside-anytrust) chains will have the ability to leverage their DAC to enable fast confirmations of withdrawals through the native token bridge. By immediately confirming assertions that have been signed by the DAC, finality can be reduced to ~15 minutes.