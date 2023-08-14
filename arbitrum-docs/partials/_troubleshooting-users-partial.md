### Why do I need ETH to use the Arbitrum network? {#why-do-i-need-eth-to-use-the-arbitrum-network}
<p>When moving funds (ETH and non-ETH) from Ethereum (L1) to Arbitrum (L2), you'll need to have ETH in your wallet on the corresponding Arbitrum chain. This is because ETH is the currency used for gas fees on Arbitrum and all Arbitrum transactions are powered by ETH.</p>

<p></p>

<p></p>



### Do I need to pay a tip / Priority fee for my Arbitrum transactions? {#do-i-need-to-pay-a-tip--priority-fee-for-my-arbitrum-transactions}
<p>Since transactions are processed in the order that the Sequencer receives them, no priority fee is necessary for Arbitrum transactions; if a transaction does include a priority fee, it will be refunded to the transaction's origin address at the end of the execution.</p>



### How can I see the balance of my ETH / Tokens on Arbitrum in my wallet? {#how-can-i-see-the-balance-of-my-eth--tokens-on-arbitrum-in-my-wallet}
<p>Most wallets are "connected" to one given network at a time. To view your Ether / Token balances, ensure that you are connected to the appropriate Arbitrum chain. In MetaMask, you can switch networks via the "networks" dropdown. In this dropdown, select your desired network (either Arbitrum One or Arbitrum Nova for our mainnet networks). If your desired network hasn't been added to your wallet yet, you can add it at <a href="https://bridge.arbitrum.io/">https://bridge.arbitrum.io/</a>.</p>

<p></p>



### What happens if I send my funds to an exchange that does not support Arbitrum? {#what-happens-if-i-send-my-funds-to-an-exchange-that-does-not-support-arbitrum}
<p>If you send the funds and the receiving wallet/exchange does not support the Arbitrum network you are sending funds through, there is unfortunately nothing that we can do to recover your funds. You would need to contact the wallet/exchage support and see if they can do anything to help you retrieve the funds.</p>

<p></p>



### Does Arbitrum have a mempool? {#does-arbitrum-have-a-mempool}
<p>The Arbitrum Sequencer orders transactions on a first come, first served basis; the Sequencer inserts transactions into a queue based on the order they are received and executes them accordingly. This queue thus exists in lieu of a mempool. The Sequencer's queue has no space limit; transactions on the queue will eventually timeout and be discarded if not executed in time. Under normal conditions, the queue is empty, since transactions are executed near-instantaneously.</p>

<p></p>



### What's the difference between Arbitrum Rollup and Arbitrum AnyTrust? {#whats-the-difference-between-arbitrum-rollup-and-arbitrum-anytrust}
<p>Arbitrum Rollup is an Optimistic Rollup protocol; it is trustless and permissionless. Part of how these properties are achieved is by requiring all chain data to be posted on layer 1. This means the availability of this data follows directly from the security properties of Ethereum itself, and, in turn, that any party can participate in validating the chain and ensuring its safety.</p>

<p>By contrast, Arbitrum AnyTrust introduces a trust assumption in exchange for lower fees; data availability is managed by a Data Availability Committee (DAC), a fixed, permissioned set of entities. We introduce some threshold, K, with the assumption that at least K members of the committee are honest. For simplicity, we'll hereby assume a committee of size 20 and a K value of 2:</p>

<p>If 19 out of the 20 committee members <em>and</em> the Sequencer are malicious and colluding together, they can break the chain's safety (and, e.g., steal users' funds); this is the new trust assumption.</p>

<p>If anywhere between 2 and 18 of the committee members are well behaved, the AnyTrust chain operates in "Rollup mode"; i.e., data gets posted on L1.</p>

<p>In what should be the common and happy case, however, in which at least 19 of the 20 committee members are well behaved, the system operates without posting the L2 chain's data on L1, and thus, users pay significantly lower fees. This is the core upside of AnyTrust chains over rollups.</p>

<p>Variants of the AnyTrust model in which the new trust assumption is minimized are under consideration; stay tuned.</p>

<p>For more, see <a href="https://developer.arbitrum.io/inside-anytrust">Inside AnyTrust</a>.</p>

<p></p>



### How can I check the status of my cross chain message? {#how-can-i-check-the-status-of-my-cross-chain-message}
<p>You can check the status of <em>any </em>Arbitrum cross chain message at <a href="https://retryable-dashboard.arbitrum.io/">https://retryable-dashboard.arbitrum.io/</a> (you will also be able to execute the cross chain message there, if applicable).</p>

<p>You'll need the transaction hash of the "initiating transaction":  the L1 transaction hash for an L1-to-L2 message (e.g., a deposit), or the L2 transaction hash for an L2-to-L1 message (e.g., a withdrawal).</p>

<p></p>

<p>If you cross-chain message was initiated from <a href="https://bridge.arbitrum.io/">https://bridge.arbitrum.io/</a>, you can also check its status / execute it at that site in the transaction history tab. </p>

<p></p>



### If there is a dispute, can my L2 transaction get reorged / thrown out / "yeeted"? {#if-there-is-a-dispute-can-my-l2-transaction-get-reorged--thrown-out--yeeted}
<p>Nope; once an Arbitrum transaction is included on L1, there is no way it can be reorged (unless the L1 itself reorgs, of course). A "dispute" involves Validators disagreeing over execution, i.e., the outputted state of a chain. The inputs, however, can't be disputed; they are determined by the Inbox on L1. (See <a href="https://developer.arbitrum.io/tx-lifecycle">Transaction Lifecycle</a>)</p>


### ...okay but if there's a dispute, will my transaction get delayed?<a href="https://developer.arbitrum.io/faqs/protocol-faqs#q-dispute-delay"></a>
<p>The only thing that a dispute can add delay to is the confirmation of L2-to-L1 messages. All other transactions continue to be processed, even while a dispute is still undergoing. (Additionally: in practice, most L2-to-L1 messages represent withdrawals of fungible assets; these can be trustlessly completed <em>even during a dispute</em> via trustless fast "liquidity exit" applications. See <a href="https://developer.arbitrum.io/arbos/l2-to-l1-messaging">L2-to-L1 Messages</a>).</p>


## 


### Are "Sequencers" the same entities as "Validators"? Can a centralized Sequencer act maliciously (e.g., steal all my money)? {#are-sequencers-the-same-entities-as-validators-can-a-centralized-sequencer-act-maliciously-eg-steal-all-my-money}
<p>No and no!</p>

<p>An Arbitrum Chain's Sequencer(s) and Validators and completely distinct entities, with their own distinct roles.</p>

<p>The <a href="https://developer.arbitrum.io/sequencer">Sequencer</a> is the entity granted specific privileges over ordering transactions; once the Sequencer commits to an ordering (by posting a batch on Ethereum), it has no say over what happens next (i.e., execution). A malicious/faulty Sequencer can do things like reordering transactions or <em>temporarily</em> delaying a transaction's inclusion — things which could be, to be sure, annoying and bad — but can do nothing to compromise the chain's safety.</p>

<p>The <em>Validators</em> are the ones responsible for the safety of the chain; i.e., making staked claims about the chain state, disputing each other, etc.</p>

<p>Currently, on Arbitrum One, the Sequencer is a centralized entity maintained by Offchain Labs. Eventually, the single Sequencer will be replaced by a distributed committee of Sequencers who come to consensus on transaction ordering. This upgrade will be an improvement; we don't want you to have to trust us not to reorder your transactions. However, it also isn't <em>strictly</em> necessary for Arbitrum One to achieve its most fundamental properties.</p>

<p>In other words: <em><strong>An Arbitrum Rollup chain with a centralized Sequencer could theoretically still be trustless!</strong></em></p>

<p>Which is to say — the more important thing than decentralizing the Sequencer, i.e., the thing you ought to care more about — is decentralizing the <em>Validators</em>.</p>

<p>Arbitrum One's Validator set is currently allowlisted; overtime, the allowlist will grow and then be removed entirely. For more info see <a href="https://developer.arbitrum.io/mainnet-risks">"Mainnet risks"</a>.</p>



### Why was "one week" chosen for Arbitrum One's dispute window? {#why-was-one-week-chosen-for-arbitrum-ones-dispute-window}
<p>Generally, some amount of time is necessary for the Arbitrum validators to dispute an invalid assertion.<br />
<br />
A week is expected to be more than enough time for validators to carry out an interactive dispute, assuming they don't encounter difficulty in getting their transactions included on L1. One week was chosen following the general consensus among the Ethereum research community — as well as other layer 2 projects — to provide enough time for the community to socially coordinate in the case of a coordinated Ethereum-staker censorship attack.</p>

<p></p>



### What's the state of Arbitrum One's decentralization? {#whats-the-state-of-arbitrum-ones-decentralization}
<p>See <strong><a href="https://docs.arbitrum.foundation/state-of-progressive-decentralization">"State of Progressive Decentralization"</a></strong>, or check out the work of our friends at <strong><a href="https://l2beat.com/scaling/risk/">L2BEAT</a></strong><strong>.</strong></p>

<p></p>



### Are there any Fiat on-ramps that support Arbitrum? {#are-there-any-fiat-onramps-that-support-arbitrum}
<p>Yes, you can find a list of Fiat on-ramps that support Arbitrum <a href="https://portal.arbitrum.io/one?categories=fiat-on-ramp">on our portal</a>.</p>

<p></p>



### How many blocks are needed for a transaction to be confirmed/finalized in Arbitrum? {#how-many-blocks-are-needed-for-a-transaction-to-be-confirmedfinalized-in-arbitrum}
<p>There are two levels of finality in a <a href="https://developer.arbitrum.io/tx-lifecycle">transaction lifecycle</a>:</p>

<ul><li>Soft finality: once the Sequencer receives and processes a transaction, it emits a receipt through the Sequencer's feed. At this point, if the Sequencer is trusted, the transaction will not be reordered and the state of the chain after processing the transaction can be determined.</li>
<li>Hard finality: at this stage, assuming there's at least one well-behaved active Arbitrum validator, the client can treat their transaction's finality as equivalent to an ordinary Ethereum transaction.</li>
</ul>
<p></p>



### Where can I find stats for Arbitrum? {#where-can-i-find-stats-for-arbitrum}
<p>Although we currently don't maintain any stats dashboard for Arbitrum, you can find many <a href="https://dune.com/browse/dashboards?q=arbitrum">community created dashboards</a> in Dune.</p>

<p></p>



### Will transactions with a higher "gas price bid" be confirmed first? {#will-transactions-with-a-higher-gas-price-bid-be-confirmed-first}
<p>There is no notion of mempool on Arbitrum, transactions are processed on a first come first served basis by the Sequencer. Thus, the gas price bid parameter does not influence the order in which a transaction is processed.</p>

<p></p>



### Where can I find a list of the current validators of the Arbitrum chains? {#where-can-i-find-a-list-of-the-current-validators-of-the-arbitrum-chains}
<p>Validation on both Arbitrum One and Arbitrum Nova is currently allow-listed to a committee of public entities. You can see the list of validators <strong><a href="https://docs.arbitrum.foundation/state-of-progressive-decentralization#allowlisted-validators">here</a></strong>. Governance currently has the power to change this status.</p>

<p></p>



### Where can I find the current Data Availability Committee members? {#where-can-i-find-the-current-data-availability-committee-members}
<p>The Arbitrum Nova chain has a 7-party DAC, whose members can be seen <strong><a href="https://docs.arbitrum.foundation/state-of-progressive-decentralization#data-availability-committee-members">here</a></strong>. Governance has the ability to remove or add members to the committee.</p>

<p></p>



