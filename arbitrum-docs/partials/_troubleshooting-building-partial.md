### Why am I getting error "429 Too Many Requests" when using one of Offchain Labs' Public RPCs? {#why-am-i-getting-error-429-too-many-requests-when-using-one-of-offchain-labs-public-rpcs}
<p>Offchain Labs offers public RPCs for free, but limits requests to prevent DOSing. Hitting the rate limit could come from your request frequency and/or the resources required to process the requests. If you hitting our rate limit, we recommend <a href="https://developer.arbitrum.io/node-running/running-a-node">running your own node</a> or <a href="https://developer.arbitrum.io/node-running/node-providers">using a third party node provider</a>.</p>

<p></p>



### I tried to create a retryable ticket but the transaction reverted on L1.  How can I debug the issue? {#i-tried-to-create-a-retryable-ticket-but-the-transaction-reverted-on-l1--how-can-i-debug-the-issue}
<p>Creation of retryable tickets can revert with one of these custom errors:</p>

<ol><li><strong>InsufficientValue</strong>: not enough gas included in your L1 transaction's callvalue to cover the total cost of your retryable ticket; i.e., <code>msg.value &lt; (maxSubmissionCost + l2CallValue + gasLimit * maxFeePerGas)</code>. Note that as of the Nitro upgrade, your L1 transaction's callvalue must cover this full cost (previously an L2 message's execution could be paid for with funds on L2: see <a href="https://developer.offchainlabs.com/migration/dapp_migration#breaking-changes">dapp migration</a> and "retryable ticket creation" [TODO link to inbox / ticket creation FAQ].)</li>
<li><strong>InsufficientSubmissionCost: </strong>provided submission cost isn't high enough to create your retryable ticket [TODO: link to submission cost FAQ]</li>
<li><strong>GasLimitTooLarge: </strong>provided gas limit is greater than 2^64</li>
<li><strong>DataTooLarge</strong>: provided data is greater than 117.964 KB  (90% of Geth's 128 KB transaction size limit).</li>
</ol>
<p></p>

<p>To figure out which error caused your transaction to revert, we recommend using etherscan's Parity VM trace support (Tenderly is generally a very useful debugging tool; however, it can be buggy when it comes to custom Geth errors).</p>

<p>Use the following link to view the Parity VM trace of your failed tx (replacing the tx-hash with your own, and using the appropriate etherscan root url):<br />
<br />
<a href="https://goerli.etherscan.io/vmtrace?txhash=0x382bfef03a7f1185a91582b49837740473591fb8715ce7f15e389f1ade630b09&type=parity#raw">https://goerli.etherscan.io/vmtrace?txhash=0x382bfef03a7f1185a91582b49837740473591fb8715ce7f15e389f1ade630b09&type=parity#raw</a></p>

<p><br />
To find out the reversion error signature, go to the "Raw Traces" tab, and scroll down to find the last "subtrace" in which your tx is reverted. Then find "output" field of that subtrace.</p>

<p> (In the above example the desirable "output" is:<br />
<code>{'0x7040b58c0000000000000000000000000000000000000000000000000001476b081e80000000000000000000000000000000000000000000000000000000000000000000'}</code> )</p>

<p></p>

<p>The first four bytes of the output is the custom error signature;<strong> i</strong>n our example it's <code>0x7040b58c</code> . </p>

<p><br />
To let's find out which is custom error this signature represents, we can use this handy tool by Samzcsun:  <a href="https://sig.eth.samczsun.com/">https://sig.eth.samczsun.com/</a></p>

<p>Checking <code>0x7040b58c</code> gives us <code>InsufficientValue(uint256,uint256)</code>. <br />
</p>



### Do I need to pay a tip / Priority fee for my Arbitrum transactions? {#do-i-need-to-pay-a-tip--priority-fee-for-my-arbitrum-transactions}
<p>Since transactions are processed in the order that the Sequencer receives them, no priority fee is necessary for Arbitrum transactions; if a transaction does include a priority fee, it will be refunded to the transaction's origin address at the end of execution.</p>



### How is the L1 portion of an Arbitrum transaction's gas fee computed?  {#how-is-the-l1-portion-of-an-arbitrum-transactions-gas-fee-computed-}
<p>The L1 fee that a transaction is required to pay is determined by compressing its data with brotli and multiplying the size of the result (in bytes) by ArbOS's current calldata price; the latter value can be queried via the <code>getPricesInWei</code>method of the <code>ArbGasInfo</code>precompile.</p>



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


### References
<ul><li><a href="https://github.com/NomicFoundation/hardhat/issues/2995">https://github.com/NomicFoundation/hardhat/issues/2995</a></li></ul>



### Why does it look like two identical transaction consume a different amount of gas? {#why-does-it-look-like-two-identical-transaction-consume-a-different-amount-of-gas}
<p></p>

<p>Calling an Arbitrum node's <code>eth_estimateGas</code> RPC returns a value sufficient to cover both the L1 and L2 components of the fee for the current gas price; this is the value that, e.g., will appear in users' wallets in the "gas limit" field.</p>

<p>Thus, if the L1 calldata price changes over time, it will appear (in e.g., a wallet) that a transaction's gas limit is changing. In fact, the L2 gas limit isn't changing, merely the total gas required to cover the transaction's L1 + L2 fees.</p>

<p>See <a href="https://medium.com/offchainlabs/understanding-arbitrum-2-dimensional-fees-fd1d582596c9">2-D fees</a> for more.</p>

<p></p>


### References
<p><a href="https://medium.com/offchainlabs/understanding-arbitrum-2-dimensional-fees-fd1d582596c9">https://medium.com/offchainlabs/understanding-arbitrum-2-dimensional-fees-fd1d582596c9</a></p>

<p></p>



