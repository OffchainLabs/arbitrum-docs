import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<!-- import { MultiDimensionalContentWidget } from '@site/src/components/MultiDimensionalContentWidget.js'; -->

<!-- <MultiDimensionalContentWidget /> -->

<!-- <div className='quickstart-tabs'> -->

<!-- todo: end the annoyance of this file not being clearly tightly coupled to the MultiDimensionalContentWidget.js file that lives somewhere else; probably move this file next to that other file -->

import InfoRollupChainPartial from './_info-rollup-chain-partial.md';

import InfoAnytrustChainPartial from './_info-anytrust-chain-partial.md';

import InfoCustomTokenChainPartial from './_info-custom-token-chain-partial.md';

import ApproveErc20TokenPartial from './_approve-erc20-token-partial.md'

import DeployOrbitChainHelpersPartial from './_deploy-orbit-chain-helpers-partial.md'

import DeployOrbitChainParametersPartial from './_deploy-orbit-chain-parameters-partial.md'

import GetDeployedChainInfoPartial from './_get-deployed-chain-info-partial.md'

import MultidimensionalContentControlsDeployOrbitChainPartial from './_multidimensional-content-controls-deploy-orbit-chain-partial.md'

import OrbitPublicPreviewBannerPartial from './_orbit-public-preview-banner-partial.md'

import PrepareChainConfigParameterForAnyTrustPartial from './_prepare-chainConfig-parameter-for-AnyTrust-partial.md'

import PrepareChainConfigParameterForRollupPartial from './_prepare-chainConfig-parameter-for-Rollup-partial.md'

import PrepareConfigParameterPartial from './_prepare-config-parameter-partial.md'

import SelectOrbitChainPartial from './_select-orbit-chain-partial.md'

import SendDeployTokenBridgeTransactionPartial from './_send-deploy-token-bridge-transaction-partial.md'

import SendOrbitChainDeploymentTransactionPartial from './_send-orbit-chain-deployment-transaction-partial.md'

import SetDacKeysetPartial from './_set-dac-keyset-partial.md'

<Tabs>
  <TabItem value="rollup-chain" label="Rollup chain">
    <InfoRollupChainPartial />
  </TabItem>
  <TabItem value="anytrust-chain" label="AnyTrust chain">
    <InfoAnytrustChainPartial />
  </TabItem>
  <TabItem value="custom-token-chain" label="Custom token chain">
    <InfoCustomTokenChainPartial />
  </TabItem>
</Tabs>
