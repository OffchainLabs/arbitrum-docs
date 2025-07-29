const fs = require('fs');
const path = require('path');
const { Application, RendererEvent } = require('typedoc');
const { parseMarkdownContentTitle } = require('@docusaurus/utils');
/**
 * Plugin to move docs files from a target folder to the same folder as used by Docusaurus site.
 *
 * It also generates a `sidebar.js` file to be used by Docusaurus to display the sidebar.
 *
 * The plugin automatically runs when the Typedoc renderer finishes. It copies the doc files from
 * the target docs folder to the Docusaurus docs folder. Uses those files, plus the generated files,
 * to generate the sidebar. It should handle these options automatically.
 *
 * Sidebar generation is based on the folder structure of the target docs folder, where it sorts
 * files by leading numbers first then alphabetically.
 */
function load(app) {
  const sdkOutputDir = app.options.getValue('out'); // This is the SDK directory
  const sourceDir = path.join(sdkOutputDir, '../../arbitrum-sdk/docs');

  app.renderer.on(RendererEvent.START, async () => {
    cleanDirectory(sdkOutputDir, ['index.mdx', 'migrate.mdx']); // Preserve manual files
  });

  app.renderer.on(RendererEvent.END, async () => {
    // Create the manual introduction and migration files
    createManualFiles(sdkOutputDir);

    // Generate sidebar only from the actual TypeDoc generated content
    const sidebarItems = generateSidebarFromSDKContent(sdkOutputDir);
    const sidebarConfig = { items: sidebarItems };
    const sidebarPath = path.join(sdkOutputDir, '../../sdk-sidebar.js');

    fs.writeFileSync(
      sidebarPath,
      `// @ts-check\n/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */\nconst typedocSidebar = ${JSON.stringify(
        sidebarConfig,
        null,
        2,
      )};\nmodule.exports = { sdkSidebar: typedocSidebar.items };`,
      'utf8',
    );
  });
}

// Cleans all files from the target directory except preserved files
function cleanDirectory(directory, preserveFiles = []) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((file) => {
      // Skip preserved files
      if (preserveFiles.includes(file)) {
        return;
      }

      const curPath = path.join(directory, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        cleanDirectory(curPath);
        fs.rmdirSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
  }
}

// Recursively copy all files and folders from source to target
function copyFiles(source, target) {
  if (!fs.existsSync(source)) {
    console.error(`Source path does not exist: ${source}`);
    return;
  }

  if (!fs.lstatSync(source).isDirectory()) {
    console.error(`Source path is not a directory: ${source}`);
    return;
  }

  fs.mkdirSync(target, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyFiles(sourcePath, targetPath);
    } else {
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch (err) {
        console.error(`Failed to copy file from ${sourcePath} to ${targetPath}:`, err);
      }
    }
  });
}

// Sort entries by leading numbers, then alphabetically, with 'index.md' first
function sortEntries(a, b) {
  if (a === 'index.md') return -1;
  if (b === 'index.md') return 1;

  const numA = a.match(/^\d+/);
  const numB = b.match(/^\d+/);
  if (numA && numB) {
    return parseInt(numA[0], 10) - parseInt(numB[0], 10);
  } else if (numA) {
    return -1;
  } else if (numB) {
    return 1;
  } else {
    // Alphabetical order
    return a.localeCompare(b);
  }
}

// Generate an in-folder sidebar with sorting
function generateSidebar(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  // Sort entries before processing
  entries.sort((a, b) => sortEntries(a.name, b.name));

  const items = entries
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subItems = generateSidebar(
          fullPath,
          basePath
            ? `${basePath}/${entry.name.replace(/^\d+-/, '')}`
            : entry.name.replace(/^\d+-/, ''),
        );
        const label = capitalizeFirstLetter(getLabelFromFilesystem(entry.name));
        return {
          type: 'category',
          label,
          items: subItems,
        };
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const docId = generateId(entry.name, basePath);
        return {
          type: 'doc',
          id: docId,
          label: generateLabel(entry),
        };
      }
    })
    .filter((item) => !!item);

  return items;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateId(name, basePath) {
  // For consistency with Docusaurus ID generation, use the same logic as getLabelFromFilesystem
  const idLabel = getLabelFromFilesystem(name);
  if (basePath) {
    return path.join(basePath, idLabel).replace(/\\/g, '/');
  }
  return idLabel;
}

function generateLabel(entry) {
  const filePath = `${entry.path}/${entry.name}`;
  const titleFromFile = getTitleFromFileContent(filePath);
  const label = titleFromFile || getLabelFromFilesystem(entry.name);
  return capitalizeFirstLetter(label);
}

function getLabelFromFilesystem(name) {
  const label = name
    .replace(/^\d+-/, '')
    .replace(/\.md$/, '')
    .replace(/\.mdx$/, '');
  return label || '';
}

function getTitleFromFileContent(filePath) {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { contentTitle } = parseMarkdownContentTitle(fileContent);

  return contentTitle || '';
}

// Generate sidebar only from the actual SDK TypeDoc content
function generateSidebarFromSDKContent(sdkDir) {
  const entries = fs.readdirSync(sdkDir, { withFileTypes: true });
  const items = [];

  // Process each entry in the SDK directory
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // This is a category (like assetBridger, dataEntities, etc.)
      const categoryPath = path.join(sdkDir, entry.name);
      const categoryFiles = fs.readdirSync(categoryPath, { withFileTypes: true });

      const categoryItems = categoryFiles
        .filter((file) => file.isFile() && file.name.endsWith('.md'))
        .map((file) => ({
          type: 'doc',
          id: `sdk/${entry.name}/${file.name.replace('.md', '')}`,
          label: capitalizeFirstLetter(
            file.name
              .replace('.md', '')
              .replace(/([A-Z])/g, ' $1')
              .trim(),
          ),
        }));

      if (categoryItems.length > 0) {
        items.push({
          type: 'category',
          label: capitalizeFirstLetter(entry.name),
          items: categoryItems,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // This is a top-level document
      items.push({
        type: 'doc',
        id: `sdk/${entry.name.replace('.md', '')}`,
        label: capitalizeFirstLetter(
          entry.name
            .replace('.md', '')
            .replace(/([A-Z])/g, ' $1')
            .trim(),
        ),
      });
    }
  }

  return items;
}

// Create manual files (introduction and migration guide) after TypeDoc generation
function createManualFiles(sdkOutputDir) {
  // Create introduction file
  const introductionContent = `# Introduction

The Arbitrum SDK is a powerful TypeScript library that streamlines interactions with Arbitrum networks. It offers robust tools for bridging tokens and passing messages between networks through an intuitive interface to the underlying smart contracts.

**Key Features**

- Token Bridging: Effortlessly bridge tokens between Ethereum and Arbitrum.
- Message Passing: Seamlessly pass messages across networks.
- Contracts Interface: Leverage a strongly-typed interface for interacting with smart contracts.

Below is an overview of the Arbitrum SDK functionality. See the [tutorials](https://github.com/OffchainLabs/arbitrum-tutorials) for more examples.

## Getting Started

Install dependencies

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="npm" label="npm">

\`\`\`sh
npm install @arbitrum/sdk
\`\`\`

</TabItem>
<TabItem value="yarn" label="yarn">

\`\`\`sh
yarn add @arbitrum/sdk
\`\`\`

</TabItem>
<TabItem value="pnpm" label="pnpm">

\`\`\`sh
pnpm install @arbitrum/sdk
\`\`\`

</TabItem>
</Tabs>

## Using the Arbitrum SDK

### Bridging assets

Arbitrum SDK can be used to bridge assets to or from an Arbitrum Network. The following asset bridgers are currently available:

- [\`EthBridger\`](./assetBridger/ethBridger.md)
- [\`Erc20Bridger\`](./assetBridger/erc20Bridger.md)

All asset bridgers have the following methods which accept different parameters depending on the asset bridger type:

- [\`deposit\`](./assetBridger/assetBridger.md#deposit) - moves assets from the Parent to the Child chain
- [\`withdraw\`](./assetBridger/assetBridger.md#withdraw) - moves assets from the Child to the Parent chain

#### Example ETH Deposit to Arbitrum One

\`\`\`ts
import { getArbitrumNetwork, EthBridger } from '@arbitrum/sdk'

// get the \`@arbitrum/sdk\` ArbitrumNetwork object using the chain id of the Arbitrum One chain
const childNetwork = await getArbitrumNetwork(42161)
const ethBridger = new EthBridger(childNetwork)

const ethDepositTxResponse = await ethBridger.deposit({
  amount: utils.parseEther('23'),
  parentSigner, // an ethers v5 signer connected to mainnet ethereum
  childProvider, // an ethers v5 provider connected to Arbitrum One
})

const ethDepositTxReceipt = await ethDepositTxResponse.wait()
\`\`\`

[Learn more in the Eth Deposit tutorial](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/eth-deposit)

#### Example ETH Withdrawal from Arbitrum One

\`\`\`ts
import { getArbitrumNetwork, EthBridger } from '@arbitrum/sdk'

// get the \`@arbitrum/sdk\` ArbitrumNetwork object using the chain id of the Arbitrum One chain
const childNetwork = await getArbitrumNetwork(42161)
const ethBridger = new EthBridger(childNetwork)

const withdrawTx = await ethBridger.withdraw({
  amount: utils.parseEther('23'),
  childSigner, // an ethers v5 signer connected to Arbitrum One
  destinationAddress: childWallet.address,
})
const withdrawRec = await withdrawTx.wait()
\`\`\`

[Learn more in the Eth Withdraw tutorial](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/eth-withdraw)

### Networks

Arbitrum SDK comes pre-configured for Mainnet and Sepolia, and their Arbitrum counterparts. Any other networks that are not pre-configured **must** be registered before being used.

#### Configuring Network

To interact with a custom [\`ArbitrumNetwork\`](./dataEntities/networks), you can register it using the [\`registerCustomArbitrumNetwork\`](./dataEntities/networks.md#registercustomarbitrumnetwork) function.

\`\`\`ts
import { registerCustomArbitrumNetwork } from '@arbitrum/sdk'

registerCustomArbitrumNetwork({
  chainID: 123456,
  name: 'Custom Arbitrum Network',
})
\`\`\`

### Cross chain messages

When assets are moved by the Parent and Child cross chain messages are sent. The lifecycles of these messages are encapsulated in the classes [\`ParentToChildMessage\`](./message/ParentToChildMessage) and [\`ChildToParentMessage\`](./message/ChildToParentMessage). These objects are commonly created from the receipts of transactions that send cross chain messages. A cross chain message will eventually result in a transaction being executed on the destination chain, and these message classes provide the ability to wait for that finalizing transaction to occur.

#### Redeem a Parent-to-Child Message

\`\`\`ts
import {
  ParentTransactionReceipt,
  ParentToChildMessageStatus,
} from '@arbitrum/sdk'

const parentTxnReceipt = new ParentTransactionReceipt(
  txnReceipt // ethers-js TransactionReceipt of an ethereum tx that triggered a Parent-to-Child message (say depositing a token via a bridge)
)

const parentToChildMessage = (
  await parentTxnReceipt.getParentToChildMessages(
    childSigner // connected ethers-js Wallet
  )
)[0]

const res = await parentToChildMessage.waitForStatus()

if (res.status === ParentToChildMessageStatus.Child) {
  // Message wasn't auto-redeemed; redeem it now:
  const response = await parentToChildMessage.redeem()
  const receipt = await response.wait()
} else if (res.status === ParentToChildMessageStatus.REDEEMED) {
  // Message successfully redeemed
}
\`\`\`

[Learn more in the Redeem Failed Retryable Tickets tutorial](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/redeem-failed-retryable)

### Inbox Tools

As part of normal operation, the Arbitrum sequencer will send messages into the rollup chain. However, if the sequencer is unavailable and not posting batches, the inbox tools can be used to force the inclusion of transactions into the Arbitrum network.

Here's how you can use the inbox tools to withdraw ether from Arbitrum One without waiting for the sequencer:

\`\`\`ts
const childNetwork = await getArbitrumNetwork(await childWallet.getChainId())

const inboxSdk = new InboxTools(parentWallet, childNetwork)
const arbSys = ArbSys__factory.connect(ARB_SYS_ADDRESS, childProvider)
const arbSysIface = arbSys.interface
const childCalldata = arbSysIface.encodeFunctionData('withdrawEth', [
  parentWallet.address,
])

const txChildRequest = {
  data: childCalldata,
  to: ARB_SYS_ADDRESS,
  value: 1,
}

const childSignedTx = await inboxSdk.signChildTx(txChildRequest, childWallet)
const childTxhash = ethers.utils.parseTransaction(childSignedTx).hash
const resultsParent = await inboxSdk.sendChildSignedTx(childSignedTx)

const inboxRec = await resultsParent.wait()
\`\`\`

[Learn more in the Delayed Inbox tutorial](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/delayedInbox-l2msg).

### Utils

- [\`EventFetcher\`](./utils/eventFetcher) - A utility to provide typing for the fetching of events
- [\`MultiCaller\`](./utils/multicall#multicaller) - A utility for executing multiple calls as part of a single RPC request. This can be useful for reducing round trips.
- [\`constants\`](./dataEntities/constants) - A list of useful Arbitrum related constants

## Development

### Run Integration tests

1. Copy the \`.env-sample\` file to \`.env\` and update the values with your own.
1. First, make sure you have a [Nitro test node](https://github.com/Offchainlabs/nitro-testnode) running. Follow the instructions [here](https://docs.arbitrum.io/node-running/how-tos/local-dev-node).
1. After the node has started up (that could take up to 20-30 mins), run \`yarn gen:network\`.
1. Once done, finally run \`yarn test:integration\` to run the integration tests.

Defaults to \`Arbitrum Sepolia\`, for custom network use \`--network\` flag.

\`Arbitrum Sepolia\` expects env var \`ARB_KEY\` to be prefunded with at least 0.02 ETH, and env var \`INFURA_KEY\` to be set.
(see \`integration_test/config.ts\`)`;

  // Create migration file
  const migrationContent = `# Migrating from v3 to v4

## Introduction

\`@arbitrum/sdk\` v4 introduces significant changes to improve support Orbit chains from Offchain Labs. This guide outlines the breaking changes to know before migrating your existing v3 code to v4.

## Major Changes Overview

1. Terminology change from L1/L2 to parent/child
2. Network types and functions updated
3. Updates to \`AssetBridger\` and \`Erc20Bridger\` classes
4. Changes to Message classes

## Detailed Changes

### 1. Terminology change from L1/L2 to parent/child

Most instances of "L1" and "L2" have been replaced with "parent" and "child" respectively. This change reflects the more general parent-child relationship between chains in the Arbitrum ecosystem.

- In most circumstances, when referring to a parent-child relationship between chains, the terms "parent" and "child" are used.
- Though, when referring explicitly to "L1", "L2", or "L3", those specific terms are still used.

### 2. Network types and functions updated

- The \`L1Network\` is no longer required to be registered before bridging.
- Only Arbitrum networks need to be registered.
- Arbitrum networks are defined as Arbitrum One, Arbitrum testnets, and any Orbit chain.
- If you need a full list of Arbitrum networks, you can use the new [\`getArbitrumNetworks\`](./dataEntities/networks#getarbitrumnetworks) function.
- To list all of the children of a network, use the new [\`getChildrenForNetwork\`](./dataEntities/networks#getchildrenfornetwork) function.

| v3 Name               | v4 Name                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| \`L2Network\`           | [\`ArbitrumNetwork\`](./dataEntities/networks#arbitrumnetwork)                             |
| \`getL2Network\`        | [\`getArbitrumNetwork\`](./dataEntities/networks#getarbitrumnetwork)                       |
| \`l2Networks\`          | [\`getArbitrumNetworks\`](./dataEntities/networks#getarbitrumnetworks)                     |
| \`addCustomNetwork\`    | [\`registerCustomArbitrumNetwork\`](./dataEntities/networks#registercustomarbitrumnetwork) |
| \`Network\`             | *removed*                                                                                          |
| \`L1Network\`           | *removed*                                                                                          |
| \`getL1Network\`        | *removed*                                                                                          |
| \`getParentForNetwork\` | *removed*                                                                                          |

#### \`ArbitrumNetwork\` type

\`Network\` type has been replaced with the [\`ArbitrumNetwork\`](./dataEntities/networks#arbitrumnetwork) type and some properties have been removed or renamed.

| v3 Name               | v4 Name         |
| --------------------- | --------------- |
| \`chainID\`             | \`chainId\`       |
| \`partnerChainID\`      | \`parentChainId\` |
| \`explorerUrl\`         | *removed*       |
| \`isArbitrum\`          | *removed*       |
| \`partnerChainIDs\`     | *removed*       |
| \`nitroGenesisBlock\`   | *removed*       |
| \`nitroGenesisL1Block\` | *removed*       |
| \`depositTimeout\`      | *removed*       |
| \`blockTime\`           | *removed*       |

#### \`TokenBridge\` type

The \`TokenBridge\` type within the[\`ArbitrumNetwork\`](./dataEntities/networks#arbitrumnetwork) object has been updated.

| v3 Name           | v4 Name               |
| ----------------- | --------------------- |
| \`l1CustomGateway\` | \`parentCustomGateway\` |
| \`l1ERC20Gateway\`  | \`parentErc20Gateway\`  |
| \`l1GatewayRouter\` | \`parentGatewayRouter\` |
| \`l1MultiCall\`     | \`parentMultiCall\`     |
| \`l1ProxyAdmin\`    | \`parentProxyAdmin\`    |
| \`l1Weth\`          | \`parentWeth\`          |
| \`l1WethGateway\`   | \`parentWethGateway\`   |
| \`l2CustomGateway\` | \`childCustomGateway\`  |
| \`l2ERC20Gateway\`  | \`childErc20Gateway\`   |
| \`l2GatewayRouter\` | \`childGatewayRouter\`  |
| \`l2Multicall\`     | \`childMultiCall\`      |
| \`l2ProxyAdmin\`    | \`childProxyAdmin\`     |
| \`l2Weth\`          | \`childWeth\`           |
| \`l2WethGateway\`   | \`childWethGateway\`    |

### 3. Updates to \`AssetBridger\` and \`Erc20Bridger\` classes

#### [\`AssetBridger\`](./assetBridger/assetBridger.md)  Class Methods

The [\`AssetBridger\`](./assetBridger/assetBridger.md) class methods and properties have been renamed to reflect the new parent-child terminology.

| v3 Name          | v4 Name              |
| ---------------- | -------------------- |
| \`l2Network\`      | \`childNetwork\`       |
| \`checkL1Network\` | \`checkParentNetwork\` |
| \`checkL2Network\` | \`checkChildNetwork\`  |

#### [\`AssetBridger\`](./assetBridger/assetBridger.md)  Class Method Parameters

The objects passed to the class methods of classes that inherit from [\`AssetBridger\`](./assetBridger/assetBridger.md) ([\`EthBridger\`](./assetBridger/ethBridger.md) and [\`Erc20Bridger\`](./assetBridger/erc20Bridger.md)) have been renamed.

| v3 Name          | v4 Name              |
| ---------------- | -------------------- |
| \`erc20L1Address\` | \`erc20ParentAddress\` |
| \`l1Provider\`     | \`parentProvider\`     |
| \`l2Provider\`     | \`childProvider\`      |
| \`l1Signer\`       | \`parentSigner\`       |
| \`l2Signer\`       | \`childSigner\`        |

#### [\`Erc20Bridger\`](./assetBridger/erc20Bridger.md) Class Methods

| v3 Name                 | v4 Name                     |
| ----------------------- | --------------------------- |
| \`getL1GatewayAddress\`   | \`getParentGatewayAddress\`   |
| \`getL2GatewayAddress\`   | \`getChildGatewayAddress\`    |
| \`getL2WithdrawalEvents\` | \`getWithdrawalEvents\`       |
| \`getL1TokenContract\`    | \`getParentTokenContract\`    |
| \`getL1ERC20Address\`     | \`getParentErc20Address\`     |
| \`getL2TokenContract\`    | \`getChildTokenContract\`     |
| \`getL2ERC20Address\`     | \`getChildErc20Address\`      |
| \`l1TokenIsDisabled\`     | \`isDepositDisabled\`         |
| \`l1Provider\`            | \`parentProvider\`            |
| \`getL1GatewaySetEvents\` | \`getParentGatewaySetEvents\` |
| \`getL2GatewaySetEvents\` | \`getChildGatewaySetEvents\`  |

#### [\`Erc20L1L3Bridger\`](./assetBridger/l1l3Bridger.md) Class Methods

| v3 Name             | v4 Name             |
| ------------------- | ------------------- |
| \`getL2ERC20Address\` | \`getL2Erc20Address\` |
| \`getL3ERC20Address\` | \`getL3Erc20Address\` |

### 4. Changes to Message classes

Message classes have been renamed and their methods updated:

| v3 Name                       | v4 Name                                   |
| ----------------------------- | ----------------------------------------- |
| \`L1TransactionReceipt\`        | \`ParentTransactionReceipt\`                |
| \`L1ContractTransaction\`       | \`ParentContractTransaction\`               |
| \`L1ToL2Message\`               | \`ParentToChildMessage\`                    |
| \`L1ToL2MessageWriter\`         | \`ParentToChildMessageWriter\`              |
| \`L1ToL2MessageReader\`         | \`ParentToChildMessageReader\`              |
| \`L1ToL2MessageReaderClassic\`  | \`ParentToChildMessageReaderClassic\`       |
| \`L1ToL2MessageStatus\`         | \`ParentToChildMessageStatus\`              |
| \`L1ToL2MessageGasEstimator\`   | \`ParentToChildMessageGasEstimator\`        |
| \`L2TransactionReceipt\`        | \`ChildTransactionReceipt\`                 |
| \`L2ContractTransaction\`       | \`ChildContractTransaction\`                |
| \`L2ToL1Message\`               | \`ChildToParentMessage\`                    |
| \`L2ToL1MessageWriter\`         | \`ChildToParentMessageWriter\`              |
| \`L2ToL1MessageReader\`         | \`ChildToParentMessageReader\`              |
| \`L2ToL1MessageStatus\`         | \`ChildToParentMessageStatus\`              |
| \`EthDepositStatus\`            | \`EthDepositMessageStatus\`                 |
| \`EthDepositMessageWaitResult\` | \`EthDepositMessageWaitForStatusResult\`    |
| \`L1ToL2MessageWaitResult\`     | \`ParentToChildMessageWaitForStatusResult\` |

#### \`ChildToParentMessageClassic\`

| v3 Name           | v4 Name                  |
| ----------------- | ------------------------ |
| \`getL2ToL1Events\` | \`getChildToParentEvents\` |

#### \`ChildToParentChainMessageNitro\`

| v3 Name           | v4 Name                  |
| ----------------- | ------------------------ |
| \`getL2ToL1Events\` | \`getChildToParentEvents\` |

#### \`ChildTransactionReceipt\`

| v3 Name             | v4 Name                    |
| ------------------- | -------------------------- |
| \`getL2ToL1Events\`   | \`getChildToParentEvents\`   |
| \`getL2ToL1Messages\` | \`getChildToParentMessages\` |

#### \`ParentToChildMessage\`

| v3 Name            | v4 Name                   |
| ------------------ | ------------------------- |
| \`EthDepositStatus\` | \`EthDepositMessageStatus\` |

#### \`ParentToChildMessageStatus\`

| v3 Name                 | v4 Name                    |
| ----------------------- | -------------------------- |
| \`FUNDS_DEPOSITED_ON_L2\` | \`FUNDS_DEPOSITED_ON_CHILD\` |

#### \`ParentTransactionReceipt\`

| v3 Name                    | v4 Name                           |
| -------------------------- | --------------------------------- |
| \`getL1ToL2MessagesClassic\` | \`getParentToChildMessagesClassic\` |
| \`getL1ToL2Messages\`        | \`getParentToChildMessages\`        |

#### \`ParentEthDepositTransactionReceipt\`

| v3 Name     | v4 Name                          |
| ----------- | -------------------------------- |
| \`waitForL2\` | \`waitForChildTransactionReceipt\` |

#### \`ParentContractCallTransactionReceipt\`

| v3 Name     | v4 Name                          |
| ----------- | -------------------------------- |
| \`waitForL2\` | \`waitForChildTransactionReceipt\` |`;

  // Write the files
  fs.writeFileSync(path.join(sdkOutputDir, 'index.mdx'), introductionContent, 'utf8');
  fs.writeFileSync(path.join(sdkOutputDir, 'migrate.mdx'), migrationContent, 'utf8');

  // Remove the TypeDoc-generated index.md file if it exists
  const indexMdPath = path.join(sdkOutputDir, 'index.md');
  if (fs.existsSync(indexMdPath)) {
    fs.unlinkSync(indexMdPath);
  }
}

exports.load = load;
