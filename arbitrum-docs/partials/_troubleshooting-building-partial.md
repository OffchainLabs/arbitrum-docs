### How does gas work on Arbitrum? {#how-does-gas-work-on-arbitrum}
<p>Fees on Arbitrum chains are collected on L2 in the chains' native currency (ETH on both Arbitrum One and Nova).</p>

<p>A transaction fee is comprised of both an L1 and an L2 component:</p>

<p>The L1 component is meant to compensate the Sequencer for the cost of posting transactions on L1 (but no more). (See <a href="https://developer.arbitrum.io/arbos/l1-pricing">L1 Pricing</a>.)</p>

<p>The L2 component covers the cost of operating the L2 chain; it uses Geth for gas calculation and thus behaves nearly identically to L1 Ethereum. One difference is that unlike on Ethereum, Arbitrum chains enforce a gas price floor; currently 0.1 gwei on Arbitrum One and 0.01 gwei on Nova (See <a href="https://docs.arbitrum.io/arbos/gas">Gas</a>).</p>

<p>L2 Gas price adjusts responsively to chain congestion, ala EIP 1559.</p>

<p></p>



### I tried to create a retryable ticket but the transaction reverted on L1.  How can I debug the issue? {#i-tried-to-create-a-retryable-ticket-but-the-transaction-reverted-on-l1--how-can-i-debug-the-issue}
<p>Creation of retryable tickets can revert with one of these custom errors:</p>

<ol><li><strong>InsufficientValue</strong>: not enough gas included in your L1 transaction's callvalue to cover the total cost of your retryable ticket; i.e., <code>msg.value &lt; (maxSubmissionCost + l2CallValue + gasLimit * maxFeePerGas)</code>. Note that as of the Nitro upgrade, your L1 transaction's callvalue must cover this full cost (previously an L2 message's execution could be paid for with funds on L2: see <a href="https://developer.offchainlabs.com/migration/dapp_migration#breaking-changes">dapp migration</a> and "retryable ticket creation".</li>
<li><strong>InsufficientSubmissionCost: </strong>provided submission cost isn't high enough to create your retryable ticket.</li>
<li><strong>GasLimitTooLarge: </strong>provided gas limit is greater than 2^64</li>
<li><strong>DataTooLarge</strong>: provided data is greater than 117.964 KB  (90% of Geth's 128 KB transaction size limit).</li>
</ol>
<p></p>

<p>To figure out which error caused your transaction to revert, we recommend using etherscan's Parity VM trace support (Tenderly is generally a very useful debugging tool; however, it can be buggy when it comes to custom Geth errors).</p>

<p>Use the following link to view the Parity VM trace of your failed transaction (replacing the tx-hash with your own, and using the appropriate etherscan root url):<br />
<br />
<a href="https://goerli.etherscan.io/vmtrace?txhash=0x382bfef03a7f1185a91582b49837740473591fb8715ce7f15e389f1ade630b09&type=parity#raw">https://goerli.etherscan.io/vmtrace?txhash=0x382bfef03a7f1185a91582b49837740473591fb8715ce7f15e389f1ade630b09&type=parity#raw</a></p>

<p><br />
To find out the reversion error signature, go to the "Raw Traces" tab, and scroll down to find the last "subtrace" in which your transaction is reverted. Then find "output" field of that subtrace.</p>

<p> (In the above example the desirable "output" is:<br />
<code>{'0x7040b58c0000000000000000000000000000000000000000000000000001476b081e80000000000000000000000000000000000000000000000000000000000000000000'}</code> )</p>

<p></p>

<p>The first four bytes of the output is the custom error signature;<strong> </strong>in our example it's <code>0x7040b58c</code> . </p>

<p><br />
To let's find out which is custom error this signature represents, we can use this handy tool by Samzcsun:  <a href="https://sig.eth.samczsun.com/">https://sig.eth.samczsun.com/</a></p>

<p>Checking <code>0x7040b58c</code> gives us <code>InsufficientValue(uint256,uint256)</code>. <br />
</p>

<p></p>



### How is the L1 portion of an Arbitrum transaction's gas fee computed?  {#how-is-the-l1-portion-of-an-arbitrum-transactions-gas-fee-computed-}
<p>The L1 fee that a transaction is required to pay is determined by compressing its data with brotli and multiplying the size of the result (in bytes) by ArbOS's current calldata price; the latter value can be queried via the <code>getPricesInWei</code>method of the <code>ArbGasInfo</code>precompile. You can find more information about gas calculations in <a href="https://medium.com/offchainlabs/understanding-arbitrum-2-dimensional-fees-fd1d582596c9">Understanding Arbitrum: 2-Dimensional Fees</a> and <a href="https://developer.arbitrum.io/devs-how-tos/how-to-estimate-gas">How to estimate gas in Arbitrum</a>.</p>

<p></p>



### What is a retryable ticket's "submission fee"? How can I calculate it? What happens if I the fee I provide is insufficient? {#what-is-a-retryable-tickets-submission-fee-how-can-i-calculate-it-what-happens-if-i-the-fee-i-provide-is-insufficient}
<p>A <a href="https://developer.arbitrum.io/arbos/l1-to-l2-messaging">retryable's</a> submission fee is a special fee a user must pay to create a retryable ticket. The fee is directly proportional to the size of the L1 calldata the retryable ticket uses. The fee can be queried using the <code>Inbox.calculateRetryableSubmissionFee</code>method. If insufficient fee is provided, the transaction will revert on L1, and the ticket won't get created. </p>

<p></p>



### Which method in the Inbox contract should I use to submit a retryable ticket (aka L1 to L2 message)? {#which-method-in-the-inbox-contract-should-i-use-to-submit-a-retryable-ticket-aka-l1-to-l2-message}
<p>The method you should (almost certainly) use is <code>Inbox.createRetryableTicket</code>. There is an alternative method, <code>Inbox.unsafeCreateRetryableTicket</code>, which, as the name suggests, should only be used by those who fully understand its implications.</p>

<p>There are two differences between <code>createRetryableTicket</code> and <code>unsafeCreateRetryableTicket</code>:</p>

<ol><li><code>{'createRetryableTicket'}</code> will check that provided L1 callvalue is sufficient to cover the costs of creating and executing the retryable ticket (at the specified parameters) and otherwise revert directly at L1 [TODO: link to "retryable reverts at L1" faq]. <code>unsafeCreateRetryableTicket</code>, in contrast, will allow a retryable ticket to be created that is guaranteed to revert on L2.</li>
<li><code>{'createRetryableTicket'}</code> will check if either the provided <code>excessFeeRefundAddress</code> or the <code>callValueRefundAddress</code> are contracts on L1; if they are, to prevent the situation where refunds are <em>guaranteed</em> to be irrecoverable on L2, it will convert them to their <a href="https://developer.arbitrum.io/arbos/l1-to-l2-messaging#address-aliasing">address alias</a>, providing a <em>potential</em> path for fund recovery. <code>unsafeCreateRetryableTicket</code> will allow the creation of a retryable ticket with refund addresses that are L1 contracts; since no L1 contract can alias to an address that is also itself an L1 contract, refunds to these addresses on L2 will be irrecoverable.</li>
</ol>
<p>(Astute observers may note a third ticket creation method, <code>createRetryableTicketNoRefundAliasRewrite</code>; this is included only for backwards compatibility, but should be considered deprecated in favor of <code>unsafeCreateRetryableTicket</code>)</p>



### Why do I get "custom tx type" errors when I use hardhat? {#why-do-i-get-custom-tx-type-errors-when-i-use-hardhat}
<p>In Arbitrum, we use a number of non-standard <a href="https://eips.ethereum.org/EIPS/eip-2718">EIP-2718</a> typed transactions. See <a href="https://developer.arbitrum.io/arbos/geth#transaction-types">here</a> for the full list and the rationale.</p>

<p><a href="https://github.com/NomicFoundation/hardhat/releases/tag/hardhat%402.12.2">Hardhat v2.12.2</a> added supports for forking networks like Arbitrum with custom transaction types, so if you're using hardhat, upgrade to 2.12.2!</p>

<p></p>

<p><strong>References</strong></p>

<ul><li><a href="https://github.com/NomicFoundation/hardhat/issues/2995">https://github.com/NomicFoundation/hardhat/issues/2995</a></li>
</ul>
<p></p>



### Why does it look like two identical transactions consume a different amount of gas? {#why-does-it-look-like-two-identical-transactions-consume-a-different-amount-of-gas}
<p></p>

<p>Calling an Arbitrum node's <code>eth_estimateGas</code> RPC returns a value sufficient to cover both the L1 and L2 components of the fee for the current gas price; this is the value that, e.g., will appear in users' wallets in the "gas limit" field.</p>

<p>Thus, if the L1 calldata price changes over time, it will appear (in e.g., a wallet) that a transaction's gas limit is changing. In fact, the L2 gas limit isn't changing, merely the total gas required to cover the transaction's L1 + L2 fees.</p>

<p>See <a href="https://medium.com/offchainlabs/understanding-arbitrum-2-dimensional-fees-fd1d582596c9">2-D fees</a> and <a href="https://developer.arbitrum.io/devs-how-tos/how-to-estimate-gas">How to estimate gas in Arbitrum</a> for more.</p>

<p></p>

<p></p>



### Why am I getting error "429 Too Many Requests" when using one of Offchain Labs' Public RPCs? {#why-am-i-getting-error-429-too-many-requests-when-using-one-of-offchain-labs-public-rpcs}
<p>Offchain Labs offers public RPCs for free, but limits requests to prevent DOSing. Hitting the rate limit could come from your request frequency and/or the resources required to process the requests. If you are hitting our rate limit, we recommend <a href="https://developer.arbitrum.io/node-running/how-tos/running-a-full-node">running your own node</a> or <a href="https://developer.arbitrum.io/node-running/node-providers">using a third party node provider</a>.</p>

<p></p>



### How do block.number and block.timestamp work on Arbitrum? {#how-do-blocknumber-and-blocktimestamp-work-on-arbitrum}
<p>Solidity calls to <code>block.number</code> on Arbitrum will return the block number/ timestamp of the underlying L1 on a slight delay; i.e., updated every few minutes. Note that L2 block numbers (i.e., as seen in block explorers / returned by RPCs) are different, and are typically updated roughly every second.</p>

<p>Solidity calls to <code>block.timestamp</code> on Arbitrum are not linked to the timestamp of the L1 block. It is updated every L2 block based on the sequencer's clock. Furthermore, for transactions that are force-included from L1 (bypassing the Sequencer) <code>block.timestamp</code> will be equal to the L1 timestamp when the transaction was put in the delayed inbox on L1 (not force-included), or the L2 timestamp of the previous L2 block (whichever is greater of the two timestamps).</p>

<p>For more info, see <a href="https://docs.arbitrum.io/for-devs/concepts/differences-between-arbitrum-ethereum/block-numbers-and-time">block numbers and time</a>.</p>

<p></p>



### Do I need to download any special npm libraries in order to use web3.js or ethers-js on Arbitrum?  {#do-i-need-to-download-any-special-npm-libraries-in-order-to-use-web3js-or-ethersjs-on-arbitrum-}
<p>Nope; web3.js and ethers.js will work out of the box just like they do on L1 Ethereum.<br />
<br />
Once upon a time, Arbitrum developers were required to download supplemental packages with names like "arb-provider-ethers" and "arb-ethers-web3-bridge", but these packages are deprecated and no longer required! Any guide that directs devs to use them should be considered outdated.</p>

<p></p>

<p></p>



### **How many block numbers must we wait for in Arbitrum before we can confidently state that the transaction has reached finality?** {#how-many-block-numbers-must-we-wait-for-in-arbitrum-before-we-can-confidently-state-that-the-transaction-has-reached-finality}
<p>Arbitrum's block intervals fluctuate with throughput, so relying on block numbers for finality isn't recommended. However, Arbitrum nodes support Ethereum's JSON RPC, enabling the use of <code><a href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber">eth_getBlockByNumber()</a></code> to determine block finality. Here, we provide additional details on how to achieve this.</p>

<p></p>

<p>You can use <code><a href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber">eth_getBlockByNumber()</a></code> with the string <code>"latest"</code>, <code>"safe"</code>, or <code>"finalized"</code>, each offering varying degrees of finality:</p>

<p></p>

<ul><li><code>{'latest'}</code>: Provides you with the most recent Arbitrum block number that the node has observed on the L1 and indicates that the Sequencer's batch has been just published<strong> </strong>as an L1 block on the Ethereum network. It's important to note that this block has the potential to be re-orged but<strong> </strong>you can consider and trust this block as final, if you trust the sequencer.</li>
<li><code>{'safe'}</code>: Provides you with the most recent Arbitrum block number that has achieved attestations from a two-thirds majority of Ethereum's validator set. This occurs when the Sequencer's batch is posted as an L1 block on Ethereum and then the batch transactions achieve <code>safe</code> finality there. While safe blocks are typically resistant to re-orgs, they can still be re-orged in the event of a significant L1 re-org.</li>
<li><code>{'finalized'}</code>: Provides you with the most recent Arbitrum block number that is finalized on Ethereum. This means that the Sequencer's batch has been published<strong> </strong>as an L1 block on the Ethereum network and has reached a substantial depth, making it eligible for hard finality. Unlike <code>safe</code> blocks, <code>finalized</code> blocks are highly improbable to undergo re-orgs. </li>
</ul>
<p></p>

<p>To learn more about the different phases of an Arbitrum transaction, from client initiation to Layer 1 confirmation, check out <a href="https://docs.arbitrum.io/tx-lifecycle">The Lifecycle of an Arbitrum Transaction</a>.</p>

<p></p>



### How can I list my token on the Arbitrum Bridge? {#how-can-i-list-my-token-on-the-arbitrum-bridge}
<p>The L2 token list used in the Arbitrum bridge is generated from the L1 tokens that are part of the token list of Uniswap, Gemini or Coinmarketcap. This is valid for L1-native tokens that have been bridged over to L2, and for L2-native tokens that have been bridged over to L1 as long as they are part of any of those lists.</p>

<p>Currently, there isn't any L2-only token list.</p>

<p></p>

<p></p>



### What is a testnet or a devnet? {#what-is-a-testnet-or-a-devnet}
<p>Testnets (or devnets) primarily serve developers who want to test out the applications they're building without having to use any real mainnet funds.</p>

<p>Arbitrum Goerli and Arbitrum Sepolia are both testnets that have the same full feature-set as the mainnet networks. They are also a "true" L2 that run on top of the Goerli testnet (L1) and the Sepolia testnet (L1) respectively, using them for security and settlement.</p>

<p>Users can bridge any asset from the Goerli testnet (L1) into the Arbitrum Goerli testnet, and from the Sepolia testnet (L1) into the Arbitrum Sepolia testnet (and back!), using the official <a href="https://bridge.arbitrum.io/">bridge</a>.</p>

<p></p>



### Is there any testnet available on Arbitrum? {#is-there-any-testnet-available-on-arbitrum}
<p>Yes, there's an Arbitrum Goerli testnet (421613) that uses the Nitro tech stack, running on top of Ethereum Goerli, and an Arbitrum Sepolia testnet (421614) that also uses the Nitro tech stack and runs on top of Ethereum Sepolia. You can find more information <a href="https://developer.arbitrum.io/public-chains">here</a>.</p>

<p></p>



### When was Arbitrum One upgraded from Classic to Nitro? {#when-was-arbitrum-one-upgraded-from-classic-to-nitro}
<p>Arbitrum One <a href="https://medium.com/offchainlabs/its-nitro-time-86944693bf29">was upgraded</a> on August 31st, 2022, from the Classic stack to the improved <a href="https://developer.arbitrum.io/inside-arbitrum-nitro/">Nitro</a> tech stack, maintaining the same state.</p>



### Do Arbitrum chains support precompiles that are present on Ethereum? {#do-arbitrum-chains-support-precompiles-that-are-present-on-ethereum}
<p>Yes, all Arbitrum chains support all precompiles that Ethereum supports, as well as others that are not present on Ethereum. Check the <a href="https://docs.arbitrum.io/for-devs/dev-tools-and-resources/precompiles">precompiles reference page</a> for more information about Arbitrum specific precompiles.</p>

<p></p>



### What's the contract code size limit in Arbitrum chains? {#whats-the-contract-code-size-limit-in-arbitrum-chains}
<p>As specified in <a href="https://eips.ethereum.org/EIPS/eip-170">EIP-170</a>, contracts of up to 24KB are deployable on Arbitrum chains.</p>

<p></p>



### How can I find the L2 block(s) that corresponds to a given L1 block? {#how-can-i-find-the-l2-blocks-that-corresponds-to-a-given-l1-block}
<p>First of all, you should be familiar with how block numbers behave on Arbitrum. You can find information about it in <a href="https://docs.arbitrum.io/for-devs/concepts/differences-between-arbitrum-ethereum/block-numbers-and-time">Block numbers and time</a>.</p>

<p>When you query an RPC node for a transaction receipt or a block information, you obtain as part of the result the property <code>l1BlockNumber</code>, which is the L1 block number that the sequencer viewed when it processed the transaction.</p>

<p>With that, although it might be computationally complex, you can binary search the L1 block number you are looking for, and get all L2 blocks that have that <code>l1BlockNumber</code>.</p>

<p>If you want a more specific result, you can perform the same operation with the timestamp from the L1 block, instead of the actual block number.</p>



### Why do some old transactions have extremely high gas prices when querying them? {#why-do-some-old-transactions-have-extremely-high-gas-prices-when-querying-them}
<p>When Arbitrum One was running under the Arbitrum Classic stack (before Nitro), the gas price was an unbounded bid, so when requesting those transactions via RPC, you may obtain a very high amount in the <code>gasPrice</code> property.</p>

<p>Instead of that, it is recommended to look at the <code>effectiveGasPrice</code> property from the transaction receipt.</p>

<p></p>



### What is the WASM module root? {#what-is-the-wasm-module-root}
<p>The WASM module root is a 32 byte hash, which is a merkelization of the Go replay binary and its dependencies.</p>

<p>The replay binary is much too large to post on-chain, so this hash is set in the L1 rollup contract to determine the correct replay binary during fraud proofs.</p>

<p>You can find more information in <a href="https://docs.arbitrum.io/launch-orbit-chain/how-tos/customize-stf#step-4-enable-fraud-proofs">How to customize your Orbit chain's behavior</a>.</p>

<p></p>



### Why do I get a "gas required exceeds allowance" when trying to estimate the gas costs of a request? {#why-do-i-get-a-gas-required-exceeds-allowance-when-trying-to-estimate-the-gas-costs-of-a-request}
<p>During an <code>eth_estimateGas</code> call the actual request will be simulated on the node, so if the transaction reverts or if there aren't enough funds in the wallet that's making the call (usually the <code>from</code> parameter), the eth_estimateGas request will return the error <code>gas required exceeds allowance</code>.</p>

<p>Make sure you have enough funds in your wallet, and the gas fields of the request (if you're using them) are correctly set.</p>



### How can I verify that an L2 block has been processed as part of a specific RBlock? {#how-can-i-verify-that-an-l2-block-has-been-processed-as-part-of-a-specific-rblock}
<p>If you want to verify that the latest confirmed (or created) assertion has processed a specific L2 block, you can follow these steps:</p>

<ol><li>From the rollup contract, obtain the latest confirmed (or created) Rblock through the function <code>latestConfirmed</code> (or <code>latestNodeCreated</code>). In this context, we refer to RBlocks as "nodes".</li>
<li>Obtain the node information through <code>getNode</code></li>
<li>Find the <code>NodeCreated</code> event that was emitted when that node was created.</li>
<li>In that NodeCreated event, there's an <code>assertion</code> property that contains the state of the chain before processing the specified blocks, and after processing them. Get the <code>afterState.globalState</code> property</li>
<li>That value contains a bytes32Vals array with the latest L2 block hash processed in the first element.</li>
</ol>
<p>You can find an example script in our <a href="https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/l2-block-verification-in-assertion">arbitrum-tutorials</a> repository.</p>



