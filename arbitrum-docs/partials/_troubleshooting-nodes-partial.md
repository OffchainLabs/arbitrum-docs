### How do I run a node? {#how-do-i-run-a-node}
<p>See instructions <a href="https://developer.arbitrum.io/node-running/running-a-node">here</a>! </p>

<p></p>



### How  to verify the integrity of the Nitro database I currently have? {#how--to-verify-the-integrity-of-the-nitro-database-i-currently-have}
<p>We have an accumulator hash on all messages, which means that a message can't be added to the database without the previous message being correct. </p>

<p>To confirm that everything's working properly, you could just make sure that it's syncing and that the latest block is consistent with other Arbitrum nodes; e.g., you could check it against <a href="https://arbiscan.io">Arbiscan</a>  (note that Arbiscan's search field doesn't support searching by block hash).</p>

<p></p>



### How can I check if the node is running properly and diagnose the issue if it is not? {#how-can-i-check-if-the-node-is-running-properly-and-diagnose-the-issue-if-it-is-not}
<p>We have trace-level logging RPC request implemented on our node. You could use it to log all requests and responses at the trace level. (The performance impact of this should be negligible compared to the network overhead of an RPC request in the first place, especially considering that the request/response will only be serialized for logging if that log level is enabled.)</p>

<p></p>



### Why do I need an L1 node to run an Arbitrum node? {#why-do-i-need-an-l1-node-to-run-an-arbitrum-node}
<p>On the node syncing stage, Arbitrum nodes read transactions from batches that were previously posted on L1 and have been executed. They then connect to the Sequencer feed to receive new incoming batched transactions that have not yet been posted on L1.</p>

<p>When fully synced, the Arbitrum node uses the State Transition Function (STF) to consume transactions coming from the Sequencer feed and creates a new state. It also waits for the L1 batch to be posted. If the L1 batch that is finalized on L1 is different from what the Sequencer published, the node will change the state based on the L1 batched transactions.</p>

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



### **Is there any way to retrieve pre-nitro archive data from a nitro node?** {#is-there-any-way-to-retrieve-prenitro-archive-data-from-a-nitro-node}
<p>The pre-nitro stack is also referred to as a "classic" stack. Full nitro nodes start with a database that contains the information from the "classic" era. However, it is not possible for a nitro node to query archive information contained in "classic" blocks right away. To do that, you need to also run a classic node (<a href="https://developer.arbitrum.io/node-running/running-a-classic-node">instructions here</a>) and set the parameter <code>—node.rpc.classic-redirect=your-classic-node-RPC</code>.</p>

<p>Keep in mind that this information only applies to Arbitrum One nodes. Arbitrum Nova and Arbitrum Goerli nodes started with a Nitro stack from the beginning, so they don't have "classic" data.</p>

<p></p>



### How can I verify that my node is syncing at a desirable speed? {#how-can-i-verify-that-my-node-is-syncing-at-a-desirable-speed}
<p>Syncing speed can vary depending on multiple factors. You can find the minimum hardware requirements to run your node <a href="https://developer.arbitrum.io/node-running/running-a-node#minimum-hardware-configuration">in this page</a>. You should also verify your network and disk speed.</p>

<p></p>



### How can I verify that my node is fully synced? {#how-can-i-verify-that-my-node-is-fully-synced}
<p>You can make an <code>eth_syncing</code> RPC call to your node. When a nitro node is fully synced, <code>eth_syncing</code> returns the value <code>false</code> (just like a normal Geth node).</p>

<p>When a nitro node is still syncing, <code>eth_syncing</code> returns a map of values to help understand why the node is not synced. Nitro execution and bottleneck are different from a normal Geth node, so <code>eth_syncing</code> output is unique to nitro. Here, we provide more details:</p>

<p></p>

<p><strong>Messages, Batches, and Blocks:</strong></p>

<p>Nitro node reads <strong>messages </strong>from the parent chain an optionally from the message feed. It executes these messages and produces <strong>blocks.</strong> Each message produces exactly one block (a message may contain multiple transactions). In most nitro chains, message number and block number are the same. However, Arbitrum One chain has pre-nitro blocks, so for that chain message 0 produced block #XXXX, the offset between message and block number is constant in the chain.</p>

<p>On the parent chain, messages appear in batches. The number of messages per batch changes between batches.</p>

<p></p>

<p><strong><code>{'eth_syncing'}</code></strong><strong> Fields:</strong></p>

<p></p>

<p>⚠️ <strong>Note that the exact output for </strong><strong><code>eth_syncing</code></strong><strong> RPC call of an out-of-sync nitro node is not considered a stable API. It is still being actively developed and modified  without notice between versions.</strong></p>

<p></p>

<ul><li><code>{'batchSeen'}</code> is the  last batch number observed on the parent chain</li>
<li><code>{'batchProcessed'}</code> is the last batch that was processed on the parent chain. Processing means dividing the batch into messages</li>
<li><code>{'messageOfProcessedBatch'}</code> is the last message in the last processed batch</li>
<li><code>{'msgCount'}</code> specifies the number of messages known/queued by the nitro node</li>
<li><code>{'blockNum'}</code>  is the  last block created by the nitro node (up-to-date L2 block the node is synced to)</li>
<li><code>{'messageOfLastBlock'}</code> is the message that was used to produce the block above</li>
<li><code>{'broadcasterQueuedMessagesPos'}</code>  If ≠0, this is expected to be > msgCount. This field notes a message that was read from the feed but not processed because earlier messages are still missing</li>
<li><code>{'lastL1BlockNum'}</code>, <code>lastl1BlockHash</code> The last block number and hash from parent chain that nitro sees. This is used to debug the parent-chain connection<br />
</li>
</ul>
<p>⚠️ <strong>Note that if the sync process encounters an error while trying to collect the data above (</strong><em><strong>not expected</strong></em><strong>) this error will be added to the response.</strong></p>

<p></p>

<p><strong>Expected Stages of Syncing Nodes:</strong></p>

<ul><li><code>{'batchSeen > batchProcessed'}</code> Some batches were still not processed</li>
<li><code>{'msgCount > messageOfLastBlock'}</code> Some messages were processed but not all relevant blocks were built (usually the longest stage while syncing a new node)</li>
<li><code>{'broadcasterQueuedMessagesPos > msgCount'}</code> Feed is ahead of last message known to the node  </li></ul>



### **Is there an alternative to docker when running a node?** {#is-there-an-alternative-to-docker-when-running-a-node}
<p>We recommend running nitro nodes via docker, using the guides provided within our documentation. However, you can try to compile the code directly by following the steps described in the Dockerfile, or following <a href="https://developer.arbitrum.io/node-running/build-nitro-locally">this guide</a> for Debian. </p>

<p></p>



### **What are the minimum hardware requirements to run a full node?** {#what-are-the-minimum-hardware-requirements-to-run-a-full-node}
<p>You can see the minimum hardware configuration <a href="https://developer.arbitrum.io/node-running/running-a-node#minimum-hardware-configuration">in this section</a>.</p>

<p></p>



