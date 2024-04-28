import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import InfoRollupChainPartial from './_info-rollup-chain-partial.md';

import InfoAnytrustChainPartial from './_info-anytrust-chain-partial.md';

import InfoCustomTokenChainPartial from './_info-custom-token-chain-partial.md';

import ApproveErc20TokenPartial from './_approve-erc20-token-partial.md';

import DeployOrbitChainHelpersPartial from './_deploy-orbit-chain-helpers-partial.md';

import DeployOrbitChainParametersPartial from './_deploy-orbit-chain-parameters-partial.md';

import GetDeployedChainInfoPartial from './_get-deployed-chain-info-partial.md';

import PrepareConfigParameterForRollupPartial from './_prepare-config-parameter-for-rollup-partial.md';

import PrepareConfigParameterForAnyTrustPartial from './_prepare-config-parameter-for-anytrust-partial.md';

import SendDeployTokenBridgeTransactionPartial from './_send-deploy-token-bridge-transaction-partial.md';

import SendOrbitChainDeploymentTransactionPartial from './_send-orbit-chain-deployment-transaction-partial.md';

import SetDacKeysetPartial from './_set-dac-keyset-partial.md';

import ConfigRollupNodePartial from './_config-rollup-node-partial.md';

import ConfigAnytrustNodePartial from './_config-anytrust-node-partial.md';

import DeployTokenBrigePartial from './_deploy-token-brige-partial.md';

import DeployCustomTokenBrigePartial from './_deploy-custom-token-brige-partial.md';

import TabItemsRollupOrbitChainPartial from './_tabItems-rollup-orbit-chain-partial.md';

import TabItemsAnytrustOrbitChainPartial from './_tabItems-anytrust-orbit-chain-partial.md';

import TabItemsCustomTokenOrbitChainPartial from './_tabItems-custom-token-orbit-chain-partial.md'

import TabItemsCustomTokenOrbitChainPartialBottom from './_tabItems-custom-token-orbit-chain-partial-bottom.md'

import TabItemsAnytrustOrbitChainPartialBottom from './_tabItems-anytrust-orbit-chain-partial-bottom.md';

import TabItemsRollupOrbitChainPartialBottom from './_tabItems-rollup-orbit-chain-partial-bottom.md';

<div className="dynamic-content-tabs-toc">
  <Tabs
    className="tabgroup-with-label"
    defaultValue="rollup-chain"
    groupId="chain-type"
    queryString="current-chain"
    values={[
      { label: 'Rollup chain', value: 'rollup-chain' },
      { label: 'AnyTrust chain', value: 'anytrust-chain' },
      { label: 'Custom token chain', value: 'custom-token-chain' },
    ]}
  >
    <TabItem value="rollup-chain" label="Rollup chain">
            <InfoRollupChainPartial />
            <TabItemsRollupOrbitChainPartial />
            <TabItemsRollupOrbitChainPartialBottom />
    </TabItem>
    <TabItem value="anytrust-chain" label="AnyTrust chain">
            <InfoAnytrustChainPartial />
            <TabItemsAnytrustOrbitChainPartial />
            <TabItemsAnytrustOrbitChainPartialBottom />
    </TabItem>
    <TabItem value="custom-token-chain" label="Custom token chain">
              <InfoCustomTokenChainPartial />
              <TabItemsCustomTokenOrbitChainPartial />
              <TabItemsCustomTokenOrbitChainPartialBottom />
    </TabItem>
  </Tabs>
</div>
