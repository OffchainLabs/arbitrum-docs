---
title: 'Troubleshooting: Run a node'
author: symbolpunk
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Troubleshooting: Run a node

The guidance displayed on this page will change based on your selected configuration:

import MultidimensionalContentControlsPartial from '../partials/_multidimensional-content-controls-partial.md';

<MultidimensionalContentControlsPartial />

:::tip Thank you!

At the end of this troubleshooting guide, you'll find a "Generate troubleshooting report" button. Clicking this button will generate a report that includes your selected configuration. You can include this report when asking for help.

**Using this page to generate a troubleshooting report is helpful** because it gathers the information that we need in order to resolve your issue.

:::

### Step 1: Try the troubleshooting checklist

If you're running into unexpected outputs or errors, the following checklist may help you independently resolve your issue.

<div className="hide-tabs">
  <div className="checklist">
    <div className="task">
      <div className="input-container">
        <input id="tc-1" type="checkbox" />
        <span className="done"></span>
      </div>
      <div className="guidance-container">
        <label htmlFor="tc-1">1. Select an Operating system, Network, and Node type above</label>
        <p>The guidance displayed on this page will change based on your selected configuration.</p>
      </div>
    </div>
    <div className="task">
      <div className="input-container">
        <input id="tc-2" type="checkbox" />
        <span className="done"></span>
      </div>
      <div className="guidance-container">
        <label htmlFor="tc-2">2. Review the docs</label>
        <Tabs
          className="tabgroup-with-label node-type-tabgroup"
          groupId="node-type"
          defaultValue="full-node"
          values={[
            { label: 'Node type:', value: 'label' },
            { label: 'Full node', value: 'full-node' },
            { label: 'Archive node', value: 'archive-node' },
            { label: 'Validator node', value: 'validator-node' },
          ]}
        >
          <TabItem className="unclickable-element" value="label"></TabItem>
          <TabItem value="full-node">
            <Tabs
              className="tabgroup-with-label network-tabgroup"
              groupId="network"
              defaultValue="arb-one-nitro"
              values={[
                { label: 'Network:', value: 'label' },
                { label: 'Arbitrum One (Nitro)', value: 'arb-one-nitro' },
                { label: 'Arbitrum One (Classic)', value: 'arb-one-classic' },
                { label: 'Arbitrum Nova', value: 'arb-nova' },
                { label: 'Arbitrum Sepolia', value: 'arb-sepolia' },
                { label: 'Localhost', value: 'localhost' },
              ]}
            >
              <TabItem className="unclickable-element" value="label"></TabItem>
              <TabItem value="arb-one-nitro">
                <p>
                  The <a href="/run-arbitrum-node/run-full-node">How to run a full node (Nitro)</a>{' '}
                  may address your issue.
                </p>
              </TabItem>
              <TabItem value="arb-one-classic">
                <p>
                  <a href="/run-arbitrum-node/more-types/run-classic-node">
                    How to run a full node (Classic, pre-Nitro)
                  </a>{' '}
                  may address your issue.
                </p>
              </TabItem>
              <TabItem value="arb-nova">
                <p>
                  The <a href="/run-arbitrum-node/run-full-node">How to run a full node (Nitro)</a>{' '}
                  may address your issue.
                </p>
              </TabItem>
              <TabItem value="arb-sepolia">
                <p>
                  The <a href="/run-arbitrum-node/run-full-node">How to run a full node (Nitro)</a>{' '}
                  may address your issue.
                </p>
              </TabItem>
              <TabItem value="localhost">
                <p>
                  The{' '}
                  <a href="/run-arbitrum-node/run-local-dev-node">How to run a local dev node</a>{' '}
                  may address your issue.
                </p>
              </TabItem>
            </Tabs>
          </TabItem>
          <TabItem value="archive-node">
            <p>
              <a href="/run-arbitrum-node/more-types/run-archive-node">
                How to run an archive node
              </a>{' '}
              may address your issue.
            </p>
          </TabItem>
          <TabItem value="validator-node">
            <p>
              <a href="/run-arbitrum-node/more-types/run-validator-node">How to run a validator</a>{' '}
              may address your issue.
            </p>
          </TabItem>
        </Tabs>
      </div>
    </div>
    <div className="task">
      <div className="input-container">
        <input id="tc-3" type="checkbox" />
        <span className="done"></span>
      </div>
      <div className="guidance-container">
        <label htmlFor="tc-3">3. Review the FAQ</label>
        <p>
          Answers to frequently asked questions can be found in{' '}
          <a href="/node-running/faq">Frequently asked questions: Run a node</a>.
        </p>
      </div>
    </div>
  </div>
</div>

### Step 2: Look for your scenario

Common troubleshooting scenarios and solutions are detailed below.

<table className="small-table">
  <tbody>
    <tr>
      <th style={{ minWidth: 180 + 'px' }}>Scenario</th>
      <th>Solution</th>
    </tr>
    <tr>
      <td>
        You see <code>Unindex transactions</code>.
      </td>
      <td>
        This is expected behavior. You'll see this when your node removes old <code>txlookup</code>{' '}
        indices. This is emitted from the base Geth node, so you'd see the same output from a
        mainnet Geth node.
      </td>
    </tr>
    <tr>
      <td>
        You see <code>Head state missing, repairing</code>.
      </td>
      <td>
        This is usually because your node shut down ungracefully. In most cases it will recover in
        few minutes, but if it not, you may have to re-sync your node. Remember to shut down your
        node gracefully with the following command:{' '}
        <code>docker stop —time=300 $(docker ps -aq)</code>.
      </td>
    </tr>
    <tr>
      <td>
        You see <code>failed to read inbox messages</code>
      </td>
      <td>
        This is usually because either A) your L1 RPC is unreachable or B) your L1 node hasn't
        finished syncing and an old L1 node's state that doesn't have our inbox contracts deployed
        is being used. Check your L1 RPC sync status and connection status, or consider using
        another L1 RPC to isolate the issue.
      </td>
    </tr>
    <tr>
      <td>Your local machine is running out of memory</td>
      <td>
        Nitro (and Geth) can consume a lot of memory depending on request load. It's possible that
        your machine may run out of memory when receiving tons of requests.
      </td>
    </tr>
    <tr>
      <td>
        Your Arbitrum node can’t connect to your L1 node on <code>localhost:8545</code>
      </td>
      <td>
        This is often because of a Docker port configuration issue. See
        https://stackoverflow.com/questions/43884981/unable-to-connect-localhost-in-docker.
      </td>
    </tr>
    <tr>
      <td>
        You specified your snapshot file path via the <code>--init.url</code> parameter, but the
        snapshot file isn't found.
      </td>
      <td>
        This is usually because the snapshot file isn't mounted to your Docker container. Mount it
        and change the file path to your Docker container’s mount point.
      </td>
    </tr>
    <tr>
      <td>
        You get <code>403</code> errors from the feed URL.
      </td>
      <td>
        This often happens when Cloudflare attempts to block botnets and other malicious actors, but
        accidentally ends up blocking node runners.
      </td>
    </tr>
    <tr>
      <td>
        You see{' '}
        <code>
          failed to get blobs: expected at least 6 blobs for slot `[slot_number]` but only got 0
        </code>
      </td>
      <td>
        This often happens when you connect to a beacon chain endpoint while the blob you are
        querying is expired. To resolve this error, connect to a beacon endpoint which supports
        historical blob data (see{' '}
        <a href="/run-arbitrum-node/l1-ethereum-beacon-chain-rpc-providers#list-of-ethereum-beacon-chain-rpc-providers">
          List of Ethereum beacon chain RPC providers
        </a>
        ).
      </td>
    </tr>
  </tbody>
</table>

<!--
#### Troubleshooting your feed relay

import FeedRelayTroubleshootingPartial from '@site/../arbitrum-docs/node-running/partials/_feed-relay-troubleshooting.md';

<FeedRelayTroubleshootingPartial />
-->

### Step 3: Generate a troubleshooting report

1.  Complete the above troubleshooting checklist.
2.  Fill in the below form.
3.  Click `Generate troubleshooting report`.
4.  Copy and paste the **generated report text** when asking for support on [Discord](https://discord.gg/ZpZuw7p) or any other support channel.

<br />

import { GenerateTroubleshootingReportWidget } from '@site/src/components/GenerateTroubleshootingReportWidget.js';

<GenerateTroubleshootingReportWidget />

<div className="troubleshooting-report-area">
  <p>
    Node startup command (make sure to remove any sensitive information like, i.e., private keys)
  </p>
  <textarea
    id="vn-cmd"
    rows="3"
    placeholder='Paste here the command you use to run your node: "docker run ..."'
  ></textarea>
  <p>Unexpected output</p>
  <span>
    <strong>Tip:</strong> Paste the ~100 lines of output <strong>before and including</strong> the
    unexpected output you're asking about. You can use the following command to get the logs:{' '}
  </span>
  <code>docker logs --tail 100 YOUR_CONTAINER_ID</code>
  <textarea id="output" rows="3" placeholder="Paste your unexpected output here..."></textarea>
  <a id="generate-report" className="generate-report">
    Generate troubleshooting report
  </a>
  <div id="generated-report" className="generated-report">
    Complete the checklist above before generating...
  </div>
</div>

<!-- todo: gpt-n + langchain + pinecone -->
