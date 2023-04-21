### How do I move assets between One and Nova? {#how-do-i-move-assets-between-one-and-nova}
<p>Both Arbitrum One and Arbitrum Nova run as layers on top of Ethereum. Thus, you can always move assets between the two chains in two steps by going "through" Ethereum. In other words: withdraw your assets from Arbitrum One to Ethereum and then deposit them onto Nova, or conversely, withdraw your assets from Nova on to Ethreum and then deposit them on to Arbitrum One. These steps can all be done at <a href="https://bridge.arbitrum.io/">https://bridge.arbitrum.io/</a>.</p>

<p></p>



### What fees do I have to pay when bridging funds from L1 to L2? {#what-fees-do-i-have-to-pay-when-bridging-funds-from-l1-to-l2}
<p>When bridging over tokens from L1 to L2, you will have to sign one or two transactions with their corresponding fees:</p>

<ol><li>If you are bridging a token for the first time, you'll sign one <strong>approval transaction</strong>.</li>
<li>In all cases, you'll sign a <strong>deposit transaction</strong> that will send your tokens to the Bridge.</li>
</ol>
<p></p>

<p>Keep in mind that the approval transaction needs to be executed at least once per token and wallet. This means that if you bridge the same token from the same wallet again, you probably won't have to pay for that transaction. However, if you bridge the same token from a different wallet, you will have to pay for that transaction again.</p>

<p></p>

<p>In any case, the bridge and your wallet will guide you through the process, showing the transaction(s) that you need to sign in order to have your tokens bridged to Arbitrum.</p>

<p></p>



### How long does it take before I receive my funds when I initiate withdrawal from Arbitrum chains (One and Nova)? {#how-long-does-it-take-before-i-receive-my-funds-when-i-initiate-withdrawal-from-arbitrum-chains-one-and-nova}
<p>Using the official Arbitrum Bridge, the process will typically take <em>roughly</em> one week. However, some users opt to use third party fast bridges, which often bypass this delay (remember that third party bridges are created by third parties, so please DYOR!).</p>

<p>There's some variability in the exact wall-clock time of the dispute window, plus there's some expected additional "padding" time on both ends (no more than about an hour, typically).</p>

<p>The variability of the dispute window comes from the slight variance of block times. Arbitrum One's dispute window is 45818 blocks; this converts to ~1 week assuming 13.2 seconds per block, which was the average block time when Ethereum used Proof of Work (with the switch to Proof of Stake, average block times are about 12 seconds).</p>

<p>The "padding on both ends" involves three events that have to occur between a client receiving their transaction receipt from a Sequencer and their L2-to-L1 message being executable. After getting their receipt,</p>

<ol><li>The Sequencer posts their transaction in a batch (usually within a few minutes, though the Sequencer will wait a bit longer if the L1 is congested). Then,</li>
<li>A validator includes their transaction in an RBlock (usually within the hour). Then, after the ~week long dispute window passes, the RBlock is confirmable, and</li>
<li>Somebody (anybody) confirms the RBlock on L1 (usually within ~15 minutes).</li>
</ol>
<p>Additionally, in the rare and unlikely event of a dispute, this delay period will be extended for the dispute to resolve.</p>



