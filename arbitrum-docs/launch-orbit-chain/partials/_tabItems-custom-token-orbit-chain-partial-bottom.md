import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import DeployOrbitChainHelpersPartial from './_deploy-orbit-chain-helpers-partial.md';

import DeployOrbitChainParametersPartial from './_deploy-orbit-chain-parameters-partial.md';

import GetDeployedChainInfoPartial from './_get-deployed-chain-info-partial.md';

import PrepareConfigParameterForRollupPartial from './_prepare-config-parameter-for-rollup-partial.md';

import SendDeployTokenBridgeTransactionPartial from './_send-deploy-token-bridge-transaction-partial.md';

import SendOrbitChainDeploymentTransactionPartial from './_send-orbit-chain-deployment-transaction-partial.md';

import ConfigRollupNodePartial from './_config-rollup-node-partial.md';

import ConfigAnytrustNodePartial from './_config-anytrust-node-partial.md';

import DeployTokenBrigePartial from './_deploy-token-brige-partial.md';

import DeployCustomTokenBrigePartial from './_deploy-custom-token-brige-partial.md';

import ApproveErc20TokenPartial from './_approve-erc20-token-partial.md';

<div className="dynamic-content-tabs-toc">
  <Tabs
    className="tabgroup-with-label"
    defaultValue="1"
    groupId="rollup"
    values={[
      { label: '1. Prepare config', value: '1' },
      { label: '2. Approve token', value: '2' },
      { label: '3. Deploy chain', value: '3' },
      { label: '4. Get chain info', value: '4' },
      { label: '5. Set DAC keyset', value: '5' },
      { label: '6. Configure node', value: '6' },
      { label: '7. Deploy token bridge', value: '7' },
    ]}
  >
    <TabItem value="1" label="Prepare config">
    </TabItem>
    <TabItem value="2" label="Approve token">
    </TabItem>
    <TabItem value="3" label="Deploy chain">
    </TabItem>
    <TabItem value="4" label="Get chain info">
    </TabItem>
    <TabItem value="5" label="Set DAC keyset">
    </TabItem>
    <TabItem value="6" label="Configure node">
    </TabItem>
    <TabItem value="7" label="Deploy token bridge">
    </TabItem>
  </Tabs>
</div>
