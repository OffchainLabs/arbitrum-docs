import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import DeployOrbitChainHelpersPartial from './_deploy-orbit-chain-helpers-partial.md';

import DeployOrbitChainParametersPartial from './_deploy-orbit-chain-parameters-partial.md';

import GetDeployedChainInfoPartial from './_get-deployed-chain-info-partial.md';

import SendDeployTokenBridgeTransactionPartial from './_send-deploy-token-bridge-transaction-partial.md';

import SendOrbitChainDeploymentTransactionPartial from './_send-orbit-chain-deployment-transaction-partial.md';

import ConfigAnytrustNodePartial from './_config-anytrust-node-partial.md';

import DeployTokenBrigePartial from './_deploy-token-brige-partial.md';

import PrepareConfigParameterForAnyTrustPartial from './_prepare-config-parameter-for-anytrust-partial.md';

import SetDacKeysetPartial from './_set-dac-keyset-partial.md';




<div className="dynamic-content-tabs-toc">
  <Tabs
    className="tabgroup-with-label"
    defaultValue="1"
    groupId="rollup"
    values={[
      { label: '1. Prepare config', value: '1' },
      { label: '2. Deploy chain', value: '2' },
      { label: '3. Get chain info', value: '3' },
      { label: '4. Set DAC keyset', value: '4' },
      { label: '5. Configure node', value: '5' },
      { label: '6. Deploy token bridge', value: '6' },
    ]}
  >
    <TabItem value="1" label="Prepare config">
      <PrepareConfigParameterForAnyTrustPartial />
    </TabItem>
    <TabItem value="2" label="Deploy chain">
      <SendOrbitChainDeploymentTransactionPartial />
    </TabItem>
    <TabItem value="3" label="Get chain info">
      <GetDeployedChainInfoPartial />
    </TabItem>
    <TabItem value="4" label="Set DAC keyset">
      <SetDacKeysetPartial />
    </TabItem>
    <TabItem value="5" label="Configure node">
      <ConfigAnytrustNodePartial />
    </TabItem>
    <TabItem value="6" label="Deploy token bridge">
      <DeployTokenBrigePartial />
    </TabItem>
  </Tabs>
</div>
