### Can I use Orbit to deploy a mainnet chain?
<p>
Yes! Arbitrum Orbit's core technology has undergone a comprehensive audit and is now able to support deployments to mainnet. You can read more about it <a href="https://docs.arbitrum.io/launch-orbit-chain/concepts/public-preview-expectations#arbitrum-orbit-is-mainnet-ready-but-deploy-to-testnet-first">here</a>.
</p>

<p>

</p>


### How can I deploy an Orbit-based Layer 3 (L3) chain?
<p>
Check our <a href="https://docs.arbitrum.io/launch-orbit-chain/orbit-quickstart">Quickstart</a> to learn how to launch your own Orbit chain today.
</p>

<p>

</p>


### Do I need permission/license to launch an Orbit chain?
<p>
You can permissionlessly launch an L3 Orbit chain that settles to one of Arbitrum's Layer 2 (L2) chains. There is an emerging licensing structure will soon make it possible to permissionlessly launch an L2 Orbit chain that settles directly to Ethereum. Please get in touch with the Arbitrum Foundation or Offchain Labs for more information.
</p>

<p>
Note that launching a testnet doesn't require any license.
</p>

<p>

</p>


### Does Arbitrum officially deploy and/or maintain L3s for external teams?
<p>
No. Teams are required to deploy and maintain their Orbit chains. There are, however, several RaaS (Rollup as a Service) providers that can deploy and maintain the Orbit chain for you.
</p>

<p>

</p>


### Can I modify Orbit's underlying technology to customize my chain?
<p>
Yes, you can make any changes you require to the underlying Nitro code base.
</p>

<p>

</p>


### What Data Availability (DA) solutions are currently available for Orbit chains?
<p>
Arbitrum Orbit currently supports 4 different DA solutions:
</p>

<ul>
<li>Rollup, posting data to the parent chain which ultimately posts the data to Ethereum.</li>
<li>AnyTrust, posting data to a Data Availability Committee, selected by the chain owner.</li>
<li>Celestia, posting data to <a href="https://blog.celestia.org/celestia-is-first-modular-data-availability-network-to-integrate-with-arbitrum-orbit/">Celestia network</a>.</li>
<li>AvailDA, posting data to <a href="https://blog.availproject.org/avail-ecosystem-series-arbitrum-orbit-chains/">AvailDA</a>.</li>
</ul>
<p>
Note that using AnyTrust gives the chain owner the most flexibility and cheapest fees.
</p>

<p>

</p>


### What token is used to pay gas fees on Orbit chains?
<p>
By default, Orbit chains pay gas in ETH. However, Orbit chains using AnyTrust can be configured to use any ERC-20 token as the gas fee token of the chain.
</p>

<p>

</p>


### Can I use Ethereum toolkits to develop on my Orbit chain?
<p>
Orbit chains are fully EVM-compatible. Most tools that support Ethereum should be able to support an Orbit chain. There are, however, certain differences that developers need to keep in mind when building on an Orbit chain. You can find them <a href="https://docs.arbitrum.io/for-devs/concepts/differences-between-arbitrum-ethereum/overview">here</a>.
</p>

<p>

</p>


### Do Orbit chains have any built-in AA solution?
<p>
Not by default, but they can be customized to have native AA.
</p>


### Is there any cross-chain bridging solution between two Orbit chains?
<p>
There is currently no Orbit-to-Orbit native bridging solution, other than going through the parent chain (if they share the same parent chain). However, there are many third-party bridges that have expressed interest in supporting Orbit chains.
</p>

<p>

</p>


### Is there an official block explorer for Orbit chains?
<p>
Orbit chains deployments usually come with an open-source blockscout explorer by default, but there are many third-party solutions that have expressed interest in supporting Orbit chains.
</p>

<p>

</p>


### Is there any indexing solution that supports Orbit chains?
<p>
Similar to bridges and block explorers, there are many third-party indexing solutions that have expressed interest in supporting Orbit chains.
</p>

<p>

</p>


### Can I increase the maximum contract size for my Orbit chain?
<p>
Yes, Orbit supports an increased smart contract size limit of up to 96kB. You can use our <a href="https://github.com/OffchainLabs/arbitrum-orbit-sdk">Orbit SDK</a> and configure the parameters <a href="https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/src/prepareChainConfig.ts#L29">MaxCodeSize and MaxInitCodeSize</a> when calling <a href="https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/prepare-node-config/index.ts#L43">prepareNodeConfig</a>. Note that the smart contract size limit parameters can't be changed via upgrade after deployment.
</p>

<p>

</p>


### How can I modify Nitro to force posting an invalid assertion and test the fraud proof mechanism?
<p>
Forcing an invalid assertion in the chain is not supported at the moment. However, if you're building Nitro locally, you can run the following test that goes through the whole rollup/challenge mechanism:
</p>

```shell
go test ./system_tests/ -tags=challengetest -run=TestChallenge

```
<p>

</p>


### What fee collectors can be configured on my chain?
<p>
There are 4 fee types that can be configured on an Orbit chain:
</p>

<ul>
<li>L2 base fee: L2 execution fees corresponding to the minimum base price of the chain. This is paid to the infraFeeAccount, which can be set by calling <code>ArbOwner.setInfraFeeAccount()</code>.</li>
<li>L2 surplus fee: L2 execution fees above the minimum base price (in the case of congestion). This is paid to the networkFeeAccount, which can be set by calling <code>ArbOwner.setNetworkFeeAccount()</code>.</li>
<li>L1 base fee: Relative fees for posting a transaction on the parent chain. This is paid ultimately to the fee collector of the active batch poster. The batch poster can be set by calling <code>SequencerInbox.setIsBatchPoster()</code> on the parent chain. And a different fee collector for that batch poster can be specified by calling <code>ArbAggregator.setFeeCollector()</code>.</li>
<li>L1 surplus fee: Any extra fees rewarded to the batch poster. This is paid to a specific L1RewardRecipient, which can be set by calling <code>ArbOwner.setL1PricingRewardRecipient()</code></li>
</ul>
<p>
More detailed information about fees can be found in the <a href="https://docs.arbitrum.io/arbos/l1-pricing">L1 fees</a> and <a href="https://docs.arbitrum.io/arbos/gas">L2 fees</a> pages.
</p>

<p>
Information about the precompiles methods can be found in the <a href="https://docs.arbitrum.io/build-decentralized-apps/precompiles/reference">Precompiles reference page</a>.
</p>

