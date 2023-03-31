---
title: "Troubleshooting: Run a node"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Troubleshooting: Run a node

The guidance displayed on this page will change based on your selected configuration:

import MultidimensionalContentControlsPartial from '@site/../arbitrum-docs/partials/_multidimensional-content-controls-partial.md';

<MultidimensionalContentControlsPartial />

<div className='hide-tabs'>

<br />
<br />


### Step 1: Try the troubleshooting checklist

If you're running into unexpected outputs or errors, the following checklist may help you independently resolve your issue.

:::tip Thank you!

**Using this checklist will help us help you** because it makes it easy for us to quickly gather the information that we need in order to resolve your issue.

:::


<div className='hide-tabs'>
    <div className='checklist'>
        <div className='task'>
            <div className='input-container'><input id="tc-1" type='checkbox'/><span className='done'></span></div>
            <div className='guidance-container'>
                <label htmlFor="tc-1">1. Select an Operating system, Network, and Node type above</label>
                <p>The guidance displayed on this page will change based on your selected configuration.</p>
            </div>
        </div>
        <div className='task'>
            <div className='input-container'><input id="tc-2" type='checkbox'/><span className='done'></span></div>
            <div className='guidance-container'>
                <label htmlFor="tc-2">2. Review the docs</label>
                 <Tabs className="tabgroup-with-label node-type-tabgroup" groupId="node-type" defaultValue="standard" values={[ 
                        {label: 'Node type:', value: 'label'},
                        {label: 'Standard', value: 'standard'},
                        {label: 'Archive', value: 'archive'},
                        {label: 'Dev', value: 'local-dev'},
                        {label: 'Feed relay', value: 'feed-relay'},
                        {label: 'Validator', value: 'validator'}
                    ]}>
                    <TabItem className="unclickable-element" value="label"></TabItem>
                    <TabItem value="standard"><p>The <a href='/node-running/running-a-node'>Quickstart</a> may address your issue.</p></TabItem>
                    <TabItem value="archive"><p><a href='/node-running/running-an-archive-node'>How to run an archive node</a> may address your issue.</p></TabItem>
                    <TabItem value="local-dev"><p><a href='/node-running/local-dev-node'>How to run a local dev node</a> may address your issue.</p></TabItem>
                    <TabItem value="feed-relay"><p><a href='/node-running/running-a-feed-relay'>How to run a feed relay</a> may address your issue.</p></TabItem>
                    <TabItem value="validator"><p><a href='/node-running/running-a-validator'>How to run a validator</a> may address your issue.</p></TabItem>
                </Tabs> 
            </div>
        </div>
        <div className='task'>
            <div className='input-container'><input id="tc-3" type='checkbox'/><span className='done'></span></div>
            <div className='guidance-container'>
                <label htmlFor="tc-3">3. Review the FAQ</label>
                <p>Answers to frequently asked questions can be found in <a href="/node-running/faq">Frequently asked questions: Run a node</a>.</p>
            </div>
        </div>
    </div>
</div>

</div>

<!-- demo of other dynamic content types
<div className='task'>
    <div className='input-container'><input id="st-1" type='checkbox'/><span className='done'></span></div>
    <div className='guidance-container'>
        <label htmlFor="st-1">4. TODO - this changes with the OS</label>
        <Tabs className="tabgroup-with-label" groupId="os" defaultValue="others" values={[
            {label: 'Operating system:', value: 'label'},
            {label: 'Linux, MacOS, Arm64', value: 'others'},
            {label: 'Windows', value: 'win'}
            ]}>
            <TabItem className="unclickable-element" value="label"></TabItem>
            <TabItem value="others"><p>Demo -  others</p></TabItem>
            <TabItem value="win"><p>Demo -  windows</p></TabItem>
        </Tabs>
    </div>
</div>
<div className='task'>
    <div className='input-container'><input id="st-2" type='checkbox'/><span className='done'></span></div>
    <div className='guidance-container'>
        <label htmlFor="st-2">5. TODO - this changes with the network</label>
        <Tabs className="tabgroup-with-label network-tabgroup" groupId="network" defaultvalue="arb-one" values={[   {label: 'Network:', value: 'label'},
                    {label: 'Localhost', value: 'localhost'},
                    {label: 'Arbitrum Goerli', value: 'arb-goerli'},
                    {label: 'Arbitrum One', value: 'arb-one'},
                    {label: 'Arbitrum Nova', value: 'arb-nova'}
                ]}>
            <TabItem className="unclickable-element" value="label"></TabItem>
            <TabItem value="localhost"><p>Demo -  localhost</p></TabItem>
            <TabItem value="arb-goerli"><p>Demo -  goerli</p></TabItem>
            <TabItem value="arb-one"><p>Demo -  one</p></TabItem>
            <TabItem value="arb-nova"><p>Demo -  nova</p></TabItem>
        </Tabs>
    </div>
</div>
-->


### Step 2: Look for your scenario

Common troubleshooting scenarios and solutions are detailed below.

<table className='small-table'>
  <tbody>
      <tr>
          <th style={{minWidth: 180 + 'px'}}>Scenario</th> 
          <th>Solution</th>
      </tr>
      <tr>
        <td>You see <code>Unindex transactions</code>.</td>
        <td>This is expected behavior. You'll see this when your node removes old <code>txlookup</code> indices. This is emitted from the base Geth node, so you'd see the same output from a mainnet Geth node.</td>
      </tr>
      <tr>
        <td>You see <code>Head state missing, repairing</code>.</td>
        <td>This is usually because your node shut down ungracefully. In most cases it will recover in few minutes, but if it not, you may have to re-sync your node. Remember to shut down your node gracefully with the following command: <code>docker stop —time=300 $(docker ps -aq)</code>.</td>
      </tr>
      <tr>
        <td>You see <code>failed to read inbox messages</code></td>
        <td>This is usually because your L1 RPC is unreachable. Check your L1 RPC status or use another L1 RPC.</td>
      </tr>
      <tr>
        <td>Your local machine is running out of memory</td>
        <td>Nitro (and Geth) can consume a lot of memory depending on request load. It's possible that your machine may run out of memory when receiving tons of requests.</td>
      </tr>
       <tr>
        <td>Your Arbitrum node can’t connect to your L1 node on <code>localhost:8545</code></td>
        <td>This is often because of a Docker port configuration issue. See https://stackoverflow.com/questions/43884981/unable-to-connect-localhost-in-docker.</td>
      </tr>
      <tr>
        <td>You specified your snapshot file path via the <code>--init.url</code> parameter, but the snapshot file isn't found.</td>
        <td>This is usually because the snapshot file isn't mounted to your Docker container. Mount it and change the file path to your Docker container’s mount point.</td>
      </tr>
      <tr>
        <td>You get <code>403</code> errors from the feed URL.</td>
        <td>This often happens when Cloudflare attempts to block botnets and other malicious actors, but accidentally ends up blocking node runners. If you see this, TODO.</td>
      </tr>
    </tbody>
</table>


<!-- 
#### Troubleshooting your feed relay

import FeedRelayTroubleshootingPartial from '@site/../arbitrum-docs/node-running/partials/_feed-relay-troubleshooting.md';

<FeedRelayTroubleshootingPartial />
-->


### Step 3: Generate a troubleshooting report

 1. Complete the above troubleshooting checklist.
 2. Fill in the below form.
 3. Click `Generate troubleshooting report`.
 4. Copy and paste the **generated report text** into [Discord](https://discord.gg/ZpZuw7p) or Telegram (TODO: confirm channels we want to direct folks to) when asking for support.

<br />

import GenerateTroubleshootingReportPartial from '@site/../arbitrum-docs/node-running/partials/_generate-troubleshooting-report.md';

<GenerateTroubleshootingReportPartial />

<!-- todo: gpt-n + langchain + pinecone -->