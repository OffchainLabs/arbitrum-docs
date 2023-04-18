### Why do I need an L1 node to run an Arbitrum node? {#why-do-i-need-an-l1-node-to-run-an-arbitrum-node}
<p>On the node syncing stage, Arbitrum nodes read transactions from batches that were previously posted on L1 and have been executed. They then connect to the Sequencer feed to receive new incoming batched transactions that have not yet been posted on L1.</p>

<p>When fully synced, the Arbitrum node uses the State Transition Function (STF) to consume transactions coming from the Sequencer feed and creates a new state. It also waits for the L1 batch to be posted. If the L1 batch that is finalized on L1 is different from what the Sequencer published, the node will change the state based on the L1 batched transactions.</p>

<p></p>



### How  to verify the integrity of the Nitro database I currently have? {#how--to-verify-the-integrity-of-the-nitro-database-i-currently-have}
<p>We have an accumulator hash on all messages, which means that a message can't be added to the database without the previous message being correct. </p>

<p>To confirm that everything's working properly, you could just make sure that it's syncing and that the latest block is consistent with other Arbitrum nodes; e.g., you could check it against <a href="https://arbiscan.io">Arbiscan</a>  (note that Arbiscan's search field doesn't support searching by block hash).</p>

<p></p>



### How can I check if the node is running properly and diagnose the issue if it is not? {#how-can-i-check-if-the-node-is-running-properly-and-diagnose-the-issue-if-it-is-not}
<p>We have trace-level logging RPC request implemented on our node. You could use it to log all requests and responses at the trace level. (The performance impact of this should be negligible compared to the network overhead of an RPC request in the first place, especially considering that the request/response will only be serialized for logging if that log level is enabled.)</p>

<p></p>



### How do I run a node? {#how-do-i-run-a-node}
<p>See instructions <a href="https://developer.arbitrum.io/node-running/running-a-node">here</a>! </p>

<p></p>



### Can I run an Arbitrum Node in p2p mode? {#can-i-run-an-arbitrum-node-in-p2p-mode}
<p>Arbitrum doesn't have a consensus mechanism, so "p2p mode" doesn't apply. For nodes to sync to the latest chain state, they connect to an L1 node to sync the chain's history that's been posted in calldata and connect to the Sequencer feed for the transactions that have yet to be posted in batches. In no case do nodes need to peer up and sync with each other.</p>



### How do I read messages from the Sequencer feed? {#how-do-i-read-messages-from-the-sequencer-feed}
<p>Running an Arbitrum relay locally as a <a href="https://developer.offchainlabs.com/node-running/running-a-node#feed-relay">Feed Relay</a> lets you subscribe to the Sequencer feed for real-time data as the Sequencer accepts and orders transactions off-chain. Visit <a href='/node-running/how-tos/read-sequencer-feed'><em>How to read the sequencer feed</em></a> for a detailed how-to.</p>



### How do I run a node locally for development? {#how-do-i-run-a-node-locally-for-development}
<p>See instructions <a href="https://developer.arbitrum.io/node-running/local-dev-node">here</a>.</p>

<p>We recommend running nitro nodes via docker; to compile directly / run without docker, you can follow the steps in this file then run the executable directly.</p>

<p></p>

<p></p>



