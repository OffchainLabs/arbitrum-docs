import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Next, we'll create your validator keys with the [Ethereum Staking Deposit CLI](https://github.com/ethereum/staking-deposit-cli).

Download - ideally on a new machine that has never been connected to the internet - the latest stable version of the deposit CLI from the [Staking Deposit CLI Releases page](https://github.com/ethereum/staking-deposit-cli/releases).

Run the following command to create your mnemonic (a unique and <strong>highly sensitive</strong> 24-word phrase) and keys:
<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Windows', value: 'win'},
    {label: 'Linux, MacOS, Arm64', value: 'others'}
]}>
  <TabItem value="win">
    <Tabs groupId="network" defaultValue="mainnet" values={[
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Holesky', value: 'holesky'},
    ]}>
      <TabItem value="mainnet">
        <pre><code>deposit.exe new-mnemonic --num_validators=1 --mnemonic_language=english --chain=mainnet</code></pre>
      </TabItem>
      <TabItem value="sepolia">
        <pre><code>deposit.exe new-mnemonic --num_validators=1 --mnemonic_language=english --chain=sepolia</code></pre>
      </TabItem>
      <TabItem value="holesky">
        <pre><code>deposit.exe new-mnemonic --num_validators=1 --mnemonic_language=english --chain=holesky</code></pre>
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="others">
    <Tabs groupId="network" defaultValue="mainnet" values={[
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Holesky', value: 'holesky'},
    ]}>
      <TabItem value="mainnet">
        <pre><code>./deposit new-mnemonic --num_validators=1 --mnemonic_language=english --chain=mainnet</code></pre>
      </TabItem>
      <TabItem value="sepolia">
        <pre><code>./deposit new-mnemonic --num_validators=1 --mnemonic_language=english --chain=sepolia</code></pre>
      </TabItem>
      <TabItem value="holesky">
        <pre><code>./deposit new-mnemonic --num_validators=1 --mnemonic_language=english --chain=holesky</code></pre>
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

 <p>Follow the CLI prompts to generate your keys. The password you choose will be needed later when importing the generated data into the Prysm validator client. This will give you the following artifacts:</p>
<ol>
  <li>A <strong>new mnemonic seed phrase</strong>. This is <strong>highly sensitive</strong> and should never be exposed to other people or networked hardware.</li>
  <li>A <code>validator_keys</code> folder. This folder will contain two files:
    <ol>
      <li><code>deposit_data-*.json</code> - contains deposit data that you’ll later upload to the Ethereum launchpad.</li>
      <li><code>keystore-m_*.json</code> - contains your public key and encrypted private key.</li>
    </ol>
  </li>
</ol>
<p>If needed, copy the <code>validator_keys</code> folder to your primary machine. Run the following command to import your keystores, replacing <code>&lt;YOUR_FOLDER_PATH&gt;</code> with the full path to your <code>validator_keys</code> folder:</p>

<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Windows', value: 'win'},
    {label: 'Linux, MacOS, Arm64', value: 'others'}
]}>
  <TabItem value="win">
    <Tabs groupId="network" defaultValue="mainnet" values={[
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Holesky', value: 'holesky'},
    ]}>
      <TabItem value="mainnet">
        <pre><code>prysm.bat validator accounts import --keys-dir=&lt;YOUR_FOLDER_PATH&gt; --mainnet</code></pre>
      </TabItem>
      <TabItem value="sepolia">
        <pre><code>prysm.bat validator accounts import --keys-dir=&lt;YOUR_FOLDER_PATH&gt; --sepolia</code></pre>
      </TabItem>
      <TabItem value="holesky">
        <pre><code>prysm.bat validator accounts import --keys-dir=&lt;YOUR_FOLDER_PATH&gt; --holesky</code></pre>
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="others">
    <Tabs groupId="network" defaultValue="mainnet" values={[
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Holesky', value: 'holesky'},
    ]}>
      <TabItem value="mainnet">
        <pre><code>./prysm.sh validator accounts import --keys-dir=&lt;YOUR_FOLDER_PATH&gt; --mainnet</code></pre>
      </TabItem>
      <TabItem value="sepolia">
        <pre><code>./prysm.sh validator accounts import --keys-dir=&lt;YOUR_FOLDER_PATH&gt; --sepolia</code></pre>
      </TabItem>
      <TabItem value="holesky">
        <pre><code>./prysm.sh validator accounts import --keys-dir=&lt;YOUR_FOLDER_PATH&gt; --holesky</code></pre>
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

<p>You’ll be prompted to specify a wallet directory twice. Provide the path to your <code>consensus</code> folder for both prompts. You should see <code>Imported accounts [...] view all of them by running accounts list</code> when your account has been successfully imported into Prysm.</p>

<Tabs groupId="network" defaultValue="mainnet" values={[
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Holesky', value: 'holesky'},
]}>
  <TabItem value="mainnet">
    <p>Next, go to the <a href='https://launchpad.ethereum.org/en/upload-deposit-data'>Mainnet Launchpad’s deposit data upload page</a> and upload your <code>deposit_data-*.json</code> file. You’ll be prompted to connect your wallet.</p>
    <p>You can then deposit 32 ETH into the Mainnet deposit contract via the Launchpad page. Exercise extreme caution throughout this procedure.</p>
  </TabItem>
  <TabItem value="sepolia">
    <p>Sepolia has a permissioned validators set. You cannot create a new validator on this network. If you are interested in running a validator on a testnet, please choose an other testnet, like Holesky.</p>
  </TabItem>
  <TabItem value="holesky">
    <p>If you need HolETH, head over to one of the following Discord servers:</p>
    <ul>
      <li><a href='https://discord.gg/ethstaker'>r/EthStaker Discord</a></li>
      <li><a href='https://discord.gg/prysmaticlabs'>Prysm Discord server</a></li>
    </ul>
    <p>Someone should be able to give you the HolETH you need.</p>
    <p>Next, go to the <a href='https://holesky.launchpad.ethereum.org/en/upload-deposit-data'>Holesky Launchpad’s deposit data upload page</a> and upload your <code>deposit_data-*.json</code> file. You’ll be prompted to connect your wallet.</p>
    <p>Exercise extreme caution throughout this procedure - <strong>never send real ETH to the testnet deposit contract.</strong></p>
  </TabItem>
</Tabs>
<p>Finally, run the following command to start your validator, replacing <code>&lt;YOUR_FOLDER_PATH&gt;</code> with the full path to your <code>consensus</code> folder and <code>&lt;YOUR_WALLET_ADDRESS&gt;</code> by the address of a wallet you own. When your validator proposes a block, it will allow you to earn block priority fees, also sometimes called "tips". See <a href='../execution-node/fee-recipient'>How to configure Fee Recipient</a> for more information about this feature:</p>

<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Windows', value: 'win'},
    {label: 'Linux, MacOS, Arm64', value: 'others'}
]}>
  <TabItem value="win">
    <Tabs groupId="network" defaultValue="mainnet" values={[
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Holesky', value: 'holesky'},
    ]}>
      <TabItem value="mainnet">
        <pre><code>prysm.bat validator --wallet-dir=&lt;YOUR_FOLDER_PATH&gt; --mainnet --suggested-fee-recipient=&lt;YOUR_WALLET_ADDRESS>&gt;</code></pre>
      </TabItem>
      <TabItem value="sepolia">
        <pre><code>prysm.bat validator --wallet-dir=&lt;YOUR_FOLDER_PATH&gt; --sepolia --suggested-fee-recipient=&lt;YOUR_WALLET_ADDRESS>&gt;</code></pre>
      </TabItem>
      <TabItem value="holesky">
        <pre><code>prysm.bat validator --wallet-dir=&lt;YOUR_FOLDER_PATH&gt; --holesky --suggested-fee-recipient=&lt;YOUR_WALLET_ADDRESS>&gt;</code></pre>
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="others">
    <Tabs groupId="network" defaultValue="mainnet" values={[
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Holesky', value: 'holesky'},
    ]}>
      <TabItem value="mainnet">
        <pre><code>./prysm.sh validator --wallet-dir=&lt;YOUR_FOLDER_PATH&gt; --mainnet --suggested-fee-recipient=&lt;YOUR_WALLET_ADDRESS>&gt;</code></pre>
      </TabItem>
      <TabItem value="sepolia">
        <pre><code>./prysm.sh validator --wallet-dir=&lt;YOUR_FOLDER_PATH&gt; --sepolia --suggested-fee-recipient=&lt;YOUR_WALLET_ADDRESS>&gt;</code></pre>
      </TabItem>
      <TabItem value="holesky">
        <pre><code>./prysm.sh validator --wallet-dir=&lt;YOUR_FOLDER_PATH&gt; --holesky --suggested-fee-recipient=&lt;YOUR_WALLET_ADDRESS>&gt;</code></pre>
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

<p>You may wonder why you need to use the <code>--suggested-fee-recipient</code> in both beacon node and validator client. The reason is it is possible to plug multiple validator clients to the same beacon node. If no <code>--suggested-fee-recipient</code> is set on a validator client, then the beacon node will fallback on its own <code>--suggested-fee-recipient</code> when proposing a block.</p>
<p>If no <code>--suggested-fee-recipient</code> is set neither on the validator client nor on the beacon node, the corresponding tips will be sent to the burn address, and forever lost,</p>

:::tip Congratulations! 

You’re now running a <strong>full Ethereum node</strong> and a <strong>validator client</strong>.

:::

It can a long time (from days to months) for your validator to become fully activated. To learn more about the validator activation process, see [Deposit Process](https://kb.beaconcha.in/ethereum-2.0-depositing). See [Check node and validator status](https://docs.prylabs.network/docs/monitoring/checking-status) for detailed status monitoring guidance.

You can leave your **execution client**, **beacon node**, and **validator client** terminal windows open and running. Once your validator is activated, it will automatically begin proposing and validating blocks.
