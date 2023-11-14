### How do I run a node? {#how-do-i-run-a-node}
<p>See instructions <a href="https://developer.arbitrum.io/node-running/how-tos/running-a-full-node">here</a>! </p>

<p></p>



### How  to verify the integrity of the Nitro database I currently have? {#how--to-verify-the-integrity-of-the-nitro-database-i-currently-have}
<p>We have an accumulator hash on all messages, which means that a message can't be added to the database without the previous message being correct. </p>

<p>To confirm that everything's working properly, you could just make sure that it's syncing and that the latest block is consistent with other Arbitrum nodes; e.g., you could check it against <a href="https://arbiscan.io/">Arbiscan</a>  (note that Arbiscan's search field doesn't support searching by block hash).</p>

<p></p>



### How can I check if the node is running properly and diagnose the issue if it is not? {#how-can-i-check-if-the-node-is-running-properly-and-diagnose-the-issue-if-it-is-not}
<p>We have trace-level logging RPC request implemented on our node. You could use it to log all requests and responses at the trace level. (The performance impact of this should be negligible compared to the network overhead of an RPC request in the first place, especially considering that the request/response will only be serialized for logging if that log level is enabled.)</p>

<p></p>



### Why do I need an L1 node to run an Arbitrum node? {#why-do-i-need-an-l1-node-to-run-an-arbitrum-node}
<p>On the node syncing stage, Arbitrum nodes read transactions from batches that were previously posted on L1 and have been executed. They then connect to the Sequencer feed to receive new incoming batched transactions that have not yet been posted on L1.</p>

<p>When fully synced, the Arbitrum node uses the State Transition Function (STF) to consume transactions coming from the Sequencer feed and creates a new state. It also waits for the L1 batch to be posted. If the L1 batch that is finalized on L1 is different from what the Sequencer published, the node will change the state based on the L1 batched transactions.</p>

<p></p>



### Can I run an Arbitrum node in p2p mode? {#can-i-run-an-arbitrum-node-in-p2p-mode}
<p>Arbitrum doesn't have a consensus mechanism, so "p2p mode" doesn't apply. For nodes to sync to the latest chain state, they connect to an L1 node to sync the chain's history that's been posted in calldata and connect to the Sequencer feed for the transactions that have yet to be posted in batches. In no case do nodes need to peer up and sync with each other.</p>



### How do I read messages from the Sequencer feed? {#how-do-i-read-messages-from-the-sequencer-feed}
<p>Running an Arbitrum relay locally as a <a href="https://developer.offchainlabs.com/node-running/how-tos/running-a-full-node#feed-relay">Feed Relay</a> lets you subscribe to the Sequencer feed for real-time data as the Sequencer accepts and orders transactions off-chain. Visit <a href='/node-running/how-tos/read-sequencer-feed'><em>How to read the sequencer feed</em></a> for a detailed how-to.</p>

<p></p>



### How do I run a node locally for development? {#how-do-i-run-a-node-locally-for-development}
<p>See instructions <a href="https://developer.arbitrum.io/node-running/how-tos/local-dev-node">here</a>.</p>

<p>We recommend running nitro nodes via docker; to compile directly / run without docker, you can follow the steps in this file then run the executable directly.</p>

<p></p>

<p></p>

<p></p>



### **Is there any way to retrieve pre-Nitro archive data from a Nitro node?** {#is-there-any-way-to-retrieve-prenitro-archive-data-from-a-nitro-node}
<p>The pre-nitro stack is also referred to as a "classic" stack. Full nitro nodes start with a database that contains the information from the "classic" era. However, it is not possible for a nitro node to query archive information contained in "classic" blocks right away. To do that, you need to also run a classic node (<a href="https://developer.arbitrum.io/node-running/how-tos/running-a-classic-node">instructions here</a>) and set the parameter <code>—node.rpc.classic-redirect=your-classic-node-RPC</code>.</p>

<p>Keep in mind that this information only applies to Arbitrum One nodes. Arbitrum Nova, Arbitrum Goerli and Arbitrum Sepolia nodes started with a Nitro stack from the beginning, so they don't have "classic" data.</p>

<p></p>



### How can I verify that my node is syncing at a desirable speed? {#how-can-i-verify-that-my-node-is-syncing-at-a-desirable-speed}
<p>Syncing speed can vary depending on multiple factors. You can find the minimum hardware requirements to run your node <a href="https://developer.arbitrum.io/node-running/how-tos/running-a-full-node#minimum-hardware-configuration">in this page</a>. You should also verify your network and disk speed.</p>

<p></p>



### How can I verify that my node is fully synced? {#how-can-i-verify-that-my-node-is-fully-synced}
<p>You can make an <code>eth_syncing</code> RPC call to your node. When a nitro node is fully synced, <code>eth_syncing</code> returns the value <code>false</code> (just like a normal Geth node).</p>

<p>When a nitro node is still syncing, <code>eth_syncing</code> returns a map of values to help understand why the node is not synced. Nitro execution and bottleneck are different from a normal Geth node, so <code>eth_syncing</code> output is unique to nitro.</p>

<p>You can find information to understand the output of <code>eth_syncing</code> in the <a href="https://docs.arbitrum.io/for-devs/concepts/differences-between-arbitrum-ethereum/rpc-methods#eth_syncing">RPC methods</a> page.</p>

<p></p>



### **Is there an alternative to docker when running a node?** {#is-there-an-alternative-to-docker-when-running-a-node}
<p>We recommend running nitro nodes via docker, using the guides provided within our documentation. However, you can try to compile the code directly by following the steps described in the Dockerfile, or following <a href="https://developer.arbitrum.io/node-running/how-tos/build-nitro-locally">this guide</a> for Debian. </p>

<p></p>



### **What are the minimum hardware requirements to run a full node?** {#what-are-the-minimum-hardware-requirements-to-run-a-full-node}
<p>You can see the minimum hardware configuration <a href="https://developer.arbitrum.io/node-running/how-tos/running-a-full-node#minimum-hardware-configuration">in this section</a>.</p>

<p></p>



### How can I migrate the date of one synced node to a new one? {#how-can-i-migrate-the-date-of-one-synced-node-to-a-new-one}
<p>From a fully synced node, you can copy its database (the <code>.arbitrum</code> directory in a default setup) to the same database folder of the new node, and it will start from the same state.</p>

<p>Keep in mind that this must be done after a clean shutdown, while the node is not running.</p>

<p></p>



