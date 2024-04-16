import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<p className='hidden-in-jwt-guide hidden-in-mergeprep-guide'>In this step, you'll run a beacon node using Prysm.</p>
<p>There is two main ways to sync a beacon node: from genesis, and from a checkpoint. It is safer and a considerably faster to sync from a checkpoint. When syncing from a checkpoint, the simplest is to connect to a checkpoint sync endpoint. A non exhaustive <a href='https://eth-clients.github.io/checkpoint-sync-endpoints'> list of checkpoint sync endpoints</a> is available.</p>
<p>In the following examples, we'll use the checkpoint sync endpoint provided by <a href='https://beaconstate.info/'>beaconstate.info</a>. <strong>Feel free to use the one you want.</strong></p>
<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Windows', value: 'win'},
    {label: 'Linux, MacOS, Arm64', value: 'others'}
]}>
  <TabItem value="win">
    <Tabs groupId="network" defaultValue="mainnet" values={[
      {label: 'Mainnet', value: 'mainnet'},
      {label: 'Sepolia', value: 'sepolia'},
      {label: 'Holesky', value: 'holesky'}
    ]}>
      <TabItem value="mainnet">
        <Tabs groupId="protocol" defaultValue="jwt" values={[
          {label: 'JWT', value: 'jwt'},
          {label: 'IPC', value: 'ipc'}
        ]}>
          <TabItem value="jwt">
            <p>Navigate to your <code>consensus</code> directory and run the following command to start your beacon node that connects to your local execution node by replacing <code>&lt;PATH_TO_JWT_FILE&gt;</code> by the path to the JWT file generated during the previous step:</p>
            <pre><code>prysm.bat beacon-chain --execution-endpoint=http://localhost:8551 --mainnet --jwt-secret=&lt;PATH_TO_JWT_FILE&gt; --checkpoint-sync-url=https://beaconstate.info --genesis-beacon-api-url=https://beaconstate.info</code></pre>
          </TabItem>
          <TabItem value="ipc">
            <p>Navigate to your <code>consensus</code> directory and run the following command to start your beacon node that connects to your local execution node by replacing <code>&lt;PATH_TO_IPC_FILE&gt;</code> by the path to the IPC file the execution client created for you during the previous step:</p>
            <pre><code>prysm.bat beacon-chain --execution-endpoint=&lt;PATH_TO_IPC_FILE&gt; --mainnet --checkpoint-sync-url=https://beaconstate.info --genesis-beacon-api-url=https://beaconstate.info</code></pre>
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="sepolia">
        <Tabs groupId="protocol" defaultValue="jwt" values={[
          {label: 'JWT', value: 'jwt'},
          {label: 'IPC', value: 'ipc'}
        ]}>
          <TabItem value="jwt"><pre><code>prysm.bat beacon-chain --execution-endpoint=http://localhost:8551 --sepolia --jwt-secret=&lt;PATH_TO_JWT_FILE&gt;  --checkpoint-sync-url=https://sepolia.beaconstate.info --genesis-beacon-api-url=https://sepolia.beaconstate.info</code></pre></TabItem>
          <TabItem value="ipc"><pre><code>prysm.bat beacon-chain --execution-endpoint=&lt;PATH_TO_IPC_FILE&gt; --sepolia --checkpoint-sync-url=https://sepolia.beaconstate.info --genesis-beacon-api-url=https://sepolia.beaconstate.info</code></pre></TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="holesky">
        <Tabs groupId="protocol" defaultValue="jwt" values={[
          {label: 'JWT', value: 'jwt'},
          {label: 'IPC', value: 'ipc'}
        ]}>
          <TabItem value="jwt"><pre><code>prysm.bat beacon-chain --execution-endpoint=http://localhost:8551 --holesky --jwt-secret=&lt;PATH_TO_JWT_FILE&gt;  --checkpoint-sync-url=https://holesky.beaconstate.info --genesis-beacon-api-url=https://holesky.beaconstate.info</code></pre></TabItem>
          <TabItem value="ipc"><pre><code>prysm.bat beacon-chain --execution-endpoint=&lt;PATH_TO_IPC_FILE&gt; --holesky --checkpoint-sync-url=https://holesky.beaconstate.info --genesis-beacon-api-url=https://holesky.beaconstate.info</code></pre></TabItem>
        </Tabs>
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="others">
    <Tabs groupId="network" defaultValue="mainnet" values={[
      {label: 'Mainnet', value: 'mainnet'},
      {label: 'Sepolia', value: 'sepolia'},
      {label: 'Holesky', value: 'holesky'}
    ]}>
      <TabItem value="mainnet">
        <Tabs groupId="protocol" defaultValue="jwt" values={[
          {label: 'JWT', value: 'jwt'},
          {label: 'IPC', value: 'ipc'}
        ]}>
          <TabItem value="jwt">
            <p>Navigate to your <code>consensus</code> directory and run the following command to start your beacon node that connects to your local execution node by replacing <code>&lt;PATH_TO_JWT_FILE&gt;</code> by the path to the JWT file generated during the previous step:</p>
            <pre><code>./prysm.sh beacon-chain --execution-endpoint=http://localhost:8551 --mainnet --jwt-secret=&lt;PATH_TO_JWT_FILE&gt; --checkpoint-sync-url=https://beaconstate.info --genesis-beacon-api-url=https://beaconstate.info</code></pre>
          </TabItem>
          <TabItem value="ipc">
            <p>Navigate to your <code>consensus</code> directory and run the following command to start your beacon node that connects to your local execution node by replacing <code>&lt;PATH_TO_IPC_FILE&gt;</code> by the path to the IPC file the execution client created for you during the previous step:</p>
            <pre><code>./prysm.sh beacon-chain --execution-endpoint=&lt;PATH_TO_IPC_FILE&gt; --mainnet --checkpoint-sync-url=https://beaconstate.info --genesis-beacon-api-url=https://beaconstate.info</code></pre>
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="sepolia">
        <Tabs groupId="protocol" defaultValue="jwt" values={[
          {label: 'JWT', value: 'jwt'},
          {label: 'IPC', value: 'ipc'}
        ]}>
          <TabItem value="jwt"><pre><code>./prysm.sh beacon-chain --execution-endpoint=http://localhost:8551 --sepolia --jwt-secret=&lt;PATH_TO_JWT_FILE&gt;  --checkpoint-sync-url=https://sepolia.beaconstate.info --genesis-beacon-api-url=https://sepolia.beaconstate.info</code></pre></TabItem>
          <TabItem value="ipc"><pre><code>./prysm.sh beacon-chain --execution-endpoint=&lt;PATH_TO_IPC_FILE&gt; --sepolia --checkpoint-sync-url=https://sepolia.beaconstate.info --genesis-beacon-api-url=https://sepolia.beaconstate.info</code></pre></TabItem>
          </Tabs>
      </TabItem>
      <TabItem value="holesky">
        <Tabs groupId="protocol" defaultValue="jwt" values={[
          {label: 'JWT', value: 'jwt'},
          {label: 'IPC', value: 'ipc'}
        ]}>
          <TabItem value="jwt"><pre><code>./prysm.sh beacon-chain --execution-endpoint=http://localhost:8551 --holesky --jwt-secret=&lt;PATH_TO_JWT_FILE&gt;  --checkpoint-sync-url=https://holesky.beaconstate.info --genesis-beacon-api-url=https://holesky.beaconstate.info</code></pre></TabItem>
          <TabItem value="ipc"><pre><code>./prysm.sh beacon-chain --execution-endpoint=&lt;PATH_TO_IPC_FILE&gt; --holesky --checkpoint-sync-url=https://holesky.beaconstate.info --genesis-beacon-api-url=https://holesky.beaconstate.info</code></pre></TabItem>
        </Tabs>
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

<div>

Syncing from a checkpoint usually takes a couple of minutes. See Sync from a checkpoint for more information about this feature.

<Tabs groupId="network" defaultValue="mainnet" values={[
      {label: 'Mainnet', value: 'mainnet'},
      {label: 'Sepolia', value: 'sepolia'},
      {label: 'Holesky', value: 'holesky'}
    ]}>
    <TabItem value="mainnet">
      If you wish to sync from genesis, you need to remove <code>--checkpoint-sync-url</code> and <code>--genesis-beacon-api-url</code> flags from the previous command. Syncing from genesis usually takes a couple days, but it can take longer depending on your network and hardware specs.
    </TabItem>
    <TabItem value="sepolia">
      If you wish to sync from genesis, you need to remove <code>--checkpoint-sync-url</code> and <code>--genesis-beacon-api-url</code> flags from the previous command and add the <code>--genesis-state=genesis.ssz</code> flag. Syncing from genesis usually takes a couple days, but it can take longer depending on your network and hardware specs.
      Download the <a href='https://github.com/eth-clients/sepolia/blob/main/bepolia/genesis.ssz'>Sepolia genesis.ssz from Github</a> into your <code>consensus</code> directory.
    </TabItem>
     <TabItem value="holesky">
      If you wish to sync from genesis, you need to remove <code>--checkpoint-sync-url</code> and <code>--genesis-beacon-api-url</code> flags from the previous command and add the <code>--genesis-state=genesis.ssz</code> flag. Syncing from genesis usually takes a couple days, but it can take longer depending on your network and hardware specs.
      Download the <a href='https://github.com/eth-clients/holesky/blob/main/custom_config_data/genesis.ssz'>Holesky genesis.ssz from Github</a> into your <code>consensus</code> directory.
    </TabItem>
</Tabs>

If you are planning to run a validator, it is <strong>strongly</strong> advised to use the <code>--suggested-fee-recipient=<WALLET ADDRESS\></code> option. When your validator proposes a block, it will allow you to earn block priority fees, also sometimes called "tips".


<p>Congratulations - you’re now running a <strong>full Ethereum node</strong>. To check the status of your node, visit <a href='https://docs.prylabs.network/docs/monitoring/checking-status'>Check node and validator status</a>.</p>

</div>
