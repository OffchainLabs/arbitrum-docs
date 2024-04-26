## Set valid keyset on parent chain

The final step in deploying your AnyTrust Orbit chain is to set up the valid keyset for your Data Availability Committee (DAC) on the parent chain. This keyset is essential for ensuring the integrity of the certificates that the DAC signs when storing Orbit chain's data. The process of generating keys and the keyset for your committee is comprehensively explained in our documentation. Once you have your keyset, it needs to be established on the `SequencerInbox` contract of your Orbit chain on the parent chain.

To facilitate this, we provide an API in Orbit SDK named `setValidKeysetPrepareTransactionRequest`. This API aids in setting the keyset on the parent chain. To use this API, you need specific information that you gathered in step 3. This includes the `upgradeExecutor` and `sequencerInbox` addresses of your Orbit chain, the generated keyset for your committee, and the account of the owner.

Here's an example of how you can use the Orbit SDK to set the keyset:

```js
const txRequest = await setValidKeysetPrepareTransactionRequest({
  coreContracts: {
    upgradeExecutor: 'upgradeExecutor_address',
    sequencerInbox: 'sequencerInbox_address',
  },
  keyset,
  account: deployer.address,
  publicClient: parentChainPublicClient,
});
```

In this example, `upgradeExecutor_address` and `sequencerInbox_address` are placeholders for the actual addresses of the respective contracts in your Orbit chain. `keyset` is the keyset you generated for your committee, and `deployer.address` refers to the owner's account address.

After you create the transaction request using the above API, the next step is to sign and send the transaction. This action will effectively set the keyset on the parent chain, allowing it to recognize and verify the valid keyset for your AnyTrust Orbit chain. This step is crucial for the operational integrity and security of your AnyTrust chain, ensuring that the data verified by the DAC is recognized and accepted by the parent chain.
