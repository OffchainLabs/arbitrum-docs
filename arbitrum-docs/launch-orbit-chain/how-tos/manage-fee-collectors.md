---
title: 'How to manage the fee collector addresses of your Orbit chain'
description: 'Learn how to manage the fee collector addresses of your Orbit chain'
author: jose-franco
sme: jose-franco
sidebar_position: 6
content_type: how-to
---

As part of the activity of an Orbit chain, different fees are collected with every transaction. These fees are collected as a single amount (the transaction fees) but are internally split into different components depending on their purpose. Each component can also be transferred to a different fee collector address that can be configured on your chain.

This guide describes the different fees that are collected, and explains how to specify the fee collector address on your chain for each fee type.

## What fees are collected on an Orbit chain?

There are four fee types that are collected on every transaction of an Orbit chain:

- **Orbit base fee**: fees paid for executing the transaction on the chain based on the minimum base price configured.

- **Orbit surplus fee**: if the chain is congested (i.e., the base price paid for the transaction is higher than the minimum base price), these fees account for executing the transaction on the chain based on any gas price paid above the minimum base price configured.

- **Parent chain base fee**: relative fees paid for posting the transaction on the parent chain. This amount is calculated based on the transaction's estimated size and the current view of the parent chain's base fee.

- **Parent chain surplus fee**: if configured, these are extra fees rewarded to the batch poster.

You can find more detailed information about these fee types in these pages:

- [L2 fees](/how-arbitrum-works/09-gas-fees.mdx#l2-gas-pricing) for the Orbit base fee and surplus fee
- [L1 fees](/how-arbitrum-works/09-gas-fees.mdx#l1-gas-pricing) for the Parent chain base fee and surplus fee

## How to configure the fee collector addresses?

Let's now look at how to configure the collector addresses for each fee type.

### Orbit base fee

Orbit base fees are paid to the `infraFeeAccount` configured in your chain. You can retrieve the current configured address by calling the method `getInfraFeeAccount()` of the [ArbOwnerPublic](/build-decentralized-apps/precompiles/02-reference.mdx#arbownerpublic) precompile. For example:

```shell
cast call --rpc-url $ORBIT_CHAIN_RPC 0x000000000000000000000000000000000000006B "getInfraFeeAccount() (address)"
```

_Note: The [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile also has a `getInfraFeeAccount()` method that can be used, but only by the owner of the chain._

Alternatively, you can use the Orbit SDK to retrieve the current address configured as `infraFeeAccount`, by calling the [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile:

```typescript
const orbitChainClient = createPublicClient({
    chain: <OrbitChainDefinition>,
    transport: http(),
}).extend(arbOwnerPublicActions);

const infraFeeAccount = await orbitChainClient.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
});
```

To set a new `infraFeeAccount`, use the method `setInfraFeeAccount(address)` of the [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile. For example:

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY 0x0000000000000000000000000000000000000070 "setInfraFeeAccount(address) ()" $NEW_INFRAFEEACCOUNT_ADDRESS
```

Or using the Orbit SDK:

```typescript
const owner = privateKeyToAccount(<OwnerPrivateKey>);
const orbitChainClient = createPublicClient({
    chain: <OrbitChainDefinition>,
    transport: http(),
}).extend(arbOwnerPublicActions);

const transactionRequest = await orbitChainClient.arbOwnerPrepareTransactionRequest({
    functionName: 'setInfraFeeAccount',
    args: [<NewInfraFeeAccountAddress>],
    upgradeExecutor: false,
    account: owner.address,
});

await orbitChainClient.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(transactionRequest),
});
```

### Orbit surplus fee

Orbit surplus fees are paid to the `networkFeeAccount` configured in your chain. You can retrieve the current configured address by calling the method `getNetworkFeeAccount()` of the [ArbOwnerPublic](/build-decentralized-apps/precompiles/02-reference.mdx#arbownerpublic) precompile. For example:

```shell
cast call --rpc-url $ORBIT_CHAIN_RPC 0x000000000000000000000000000000000000006B "getNetworkFeeAccount() (address)"
```

_Note: The [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile also has a `getNetworkFeeAccount()` method that can be used, but only by the owner of the chain._

Alternatively, you can use the Orbit SDK to retrieve the current address configured as `networkFeeAccount`, by calling the [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile:

```typescript
const orbitChainClient = createPublicClient({
    chain: <OrbitChainDefinition>,
    transport: http(),
}).extend(arbOwnerPublicActions);

const networkFeeAccount = await orbitChainClient.arbOwnerReadContract({
    functionName: 'getNetworkFeeAccount',
});
```

To set a new `networkFeeAccount`, use the method `setNetworkFeeAccount(address)` of the [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile. For example:

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY 0x0000000000000000000000000000000000000070 "setNetworkFeeAccount(address) ()" $NEW_NETWORKFEEACCOUNT_ADDRESS
```

Or using the Orbit SDK:

```typescript
const owner = privateKeyToAccount(<OwnerPrivateKey>);
const orbitChainClient = createPublicClient({
    chain: <OrbitChainDefinition>,
    transport: http(),
}).extend(arbOwnerPublicActions);

const transactionRequest = await orbitChainClient.arbOwnerPrepareTransactionRequest({
    functionName: 'setNetworkFeeAccount',
    args: [<NewNetworkFeeAccountAddress>],
    upgradeExecutor: false,
    account: owner.address,
});

await orbitChainClient.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(transactionRequest),
});
```

### Parent chain base fee

:::info ArbAggregator currently not supported in the Orbit SDK

Reading information from the `ArgAggregator` precompile or using it to set new information is currently not supported by the Orbit SDK but will be added soon. So, for now, this subsection will only show examples using `cast call` and `cast send`.

:::

Parent chain base fees are paid to the fee collector of the active batch poster configured in your chain. The current configured batch posters can be obtained by calling the method `getBatchPosters()` of the [ArbAggregator](/build-decentralized-apps/precompiles/02-reference.mdx#arbaggregator) precompile. For example:

```shell
cast call --rpc-url $ORBIT_CHAIN_RPC 0x000000000000000000000000000000000000006D "getBatchPosters() (address[])"
```

This list has to also be verified against the `SequencerInbox` contract living on the parent chain. This contract needs to have any of those addresses in its `isBatchPoster` mapping. To verify a specific address, you can check the mapping directly like this:

```shell
cast call --rpc-url $PARENT_CHAIN_RPC $SEQUENCER_INBOX_ADDRESS "isBatchPoster(address) (bool)" $BATCH_POSTER_ADDRESS
```

Once you have the current batch poster, you can obtain the fee collector address configured for that batch poster by calling the method `getFeeCollector(address)` of the [ArbAggregator](/build-decentralized-apps/precompiles/02-reference.mdx#arbaggregator) precompile and passing the address of the batch poster.

```shell
cast call --rpc-url $ORBIT_CHAIN_RPC 0x000000000000000000000000000000000000006D "getFeeCollector(address) (address)" $BATCH_POSTER_ADDRESS
```

To set a new fee collector for a specific batch poster, use the method `setFeeCollector(address, address)` of the [ArbAggregator](/build-decentralized-apps/precompiles/02-reference.mdx#arbaggregator) precompile and pass the address of the batch poster and the address of the new fee collector.

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY 0x000000000000000000000000000000000000006D "setFeeCollector(address,address) ()" $BATCH_POSTER_ADDRESS $NEW_FEECOLLECTOR_ADDRESS
```

Finally, if you want to set a new batch poster, you can call the method `addBatchPoster(address)` of the of the [ArbAggregator](/build-decentralized-apps/precompiles/02-reference.mdx#arbaggregator) precompile and pass the address of the new batch poster, and later call the method `setIsBatchPoster(address,bool)` of the SequencerInbox contract on the parent chain.

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY 0x000000000000000000000000000000000000006D "addBatchPoster(address) ()" $NEW_BATCH_POSTER_ADDRESS
```

```shell
cast send --rpc-url $PARENT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY $SEQUENCER_INBOX_ADDRESS "setIsBatchPoster(address,bool) ()" $NEW_BATCH_POSTER_ADDRESS true
```

_Note: When setting a new batch poster, its fee collector will be configured to the same address by default._

### Parent chain surplus fee

Parent chain surplus fees are paid to a specific `L1RewardRecipient` address that is configured individually per chain. The current fee collector address can be obtained by calling the method `getL1RewardRecipient()` of the [ArbGasInfo](/build-decentralized-apps/precompiles/02-reference.mdx#arbgasinfo) precompile. For example:

```shell
cast call --rpc-url $ORBIT_CHAIN_RPC 0x000000000000000000000000000000000000006C "getL1RewardRecipient() (address)"
```

To get the amount of rewards that are being paid to this fee collector, you can call the method `getL1RewardRate()` of the [ArbGasInfo](/build-decentralized-apps/precompiles/02-reference.mdx#arbgasinfo) precompile. This function will return the amount of wei per gas unit paid to the `L1RewardRecipient` configured. For example:

```shell
cast call --rpc-url $ORBIT_CHAIN_RPC 0x000000000000000000000000000000000000006C "getL1RewardRate() (uint64)"
```

Alternatively, you can obtain this information using the Orbit SDK:

```typescript
const orbitChainClient = createPublicClient({
    chain: <OrbitChainDefinition>,
    transport: http(),
}).extend(arbGasInfoPublicActions);

const parentChainRewardRecipient = await orbitChainClient.arbGasInfoReadContract({
    functionName: 'getL1RewardRecipient',
});

const parentChainRewardRate = await orbitChainClient.arbGasInfoReadContract({
    functionName: 'getL1RewardRate',
});
```

To set a new `L1RewardRecipient` address, you can call the method `setL1PricingRewardRecipient(address)` of the [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile, and pass the address of the new reward recipient. For example:

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY 0x0000000000000000000000000000000000000070 "setL1PricingRewardRecipient(address) ()" $NEW_L1REWARDRECIPIENT_ADDRESS
```

Alternatively, you can use the Orbit SDK to set the new address:

```typescript
const owner = privateKeyToAccount(<OwnerPrivateKey>);
const orbitChainClient = createPublicClient({
    chain: <OrbitChainDefinition>,
    transport: http(),
}).extend(arbOwnerPublicActions);

const transactionRequest = await orbitChainClient.arbOwnerPrepareTransactionRequest({
    functionName: 'setL1PricingRewardRecipient',
    args: [<NewL1RewardRecipientAddress>],
    upgradeExecutor: false,
    account: owner.address,
});

await orbitChainClient.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(transactionRequest),
});
```

To change the reward rate, you can use the method `setL1PricingRewardRate(uint64)` of the [ArbOwner](/build-decentralized-apps/precompiles/02-reference.mdx#arbowner) precompile and pass the amount of wei per gas unit to reward. For example:

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY 0x0000000000000000000000000000000000000070 "setL1PricingRewardRate(uint64) ()" $NEW_REWARD_RATE
```

Or using the Orbit SDK:

```typescript
const owner = privateKeyToAccount(<OwnerPrivateKey>);
const orbitChainClient = createPublicClient({
    chain: <OrbitChainDefinition>,
    transport: http(),
}).extend(arbOwnerPublicActions);

const transactionRequest = await orbitChainClient.arbOwnerPrepareTransactionRequest({
    functionName: 'setL1PricingRewardRate',
    args: [<NewRewardRate>],
    upgradeExecutor: false,
    account: owner.address,
});

await orbitChainClient.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(transactionRequest),
});
```

## How to use the fee distribution contracts?

For now, we've described how to set the individual collector addresses for each fee type. Some chains may require multiple addresses to receive the collected fees of any of the available types. In those cases, there's the possibility of using a distributor contract that can gather all fees of a specific type and distribute those among multiple addresses.

This section shows how to configure a distributor contract to manage the fees of a specific type.

:::info Distributor contracts currently not supported in the Orbit SDK

Currently, the Orbit SDK doesn't support deploying and configuring distribution contracts, but it will soon be added. So, for now, this section will only show examples using `cast send`.

:::

### Step 1. Deploy the distributor contract

An example implementation of a distributor contract can be found [here](https://github.com/OffchainLabs/fund-distribution-contracts/blob/main/src/RewardDistributor.sol). You'll have to deploy this contract on your Orbit chain.

### Step 2. Set the contract address as the desired fee type collector address

Use the instructions provided in the previous section to set the address of the deployed distributor contract as the collector of the desired fee type. For example, if you want the distributor contract to manage the Orbit surplus fees, set the `networkFeeAccount` to the address of the deployed contract.

### Step 3. Configure the recipients of fees in the contract

Now you can set the different addresses that will be receiving fees from that distributor contract. To do that, you can call the method `setRecipients(address[], uint256[])` of the distributor contract, and specify the list of addresses that will be receiving fees, and the proportion of fees for each address.

For example, if you want to set two addresses as receivers, with the first one receiving 80% of the fees and the second one receiving 20% of the fees, you'll use the following parameters:

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY $DISTRIBUTOR_CONTRACT_ADDRESS "setRecipients(address[],uint256[]) ()" "[$RECEIVER_1, $RECEIVER_2]" "[8000, 2000]"
```

### Step 4. Trigger the distribution of fees

With the recipients configured in the distributor contract, and with the contract having collected some fees, you can now trigger the distribution of fees to the recipients by using the method `distributeRewards(address[], uint256[])` of the distributor contract, and specifying the list of addresses that are configured, and the proportion of fees for each address. The parameters passed must match the information that is set in the contract (i.e., you can't specify different addresses or proportions than what's been configured beforehand).

For example, if you want to distribute the fees to the two addresses specified before, you'll use the following parameters:

```shell
cast send --rpc-url $ORBIT_CHAIN_RPC --private-key $OWNER_PRIVATE_KEY $DISTRIBUTOR_CONTRACT_ADDRESS "distributeRewards(address[],uint256[]) ()" "[$RECEIVER_1, $RECEIVER_2]" "[8000, 2000]"
```
