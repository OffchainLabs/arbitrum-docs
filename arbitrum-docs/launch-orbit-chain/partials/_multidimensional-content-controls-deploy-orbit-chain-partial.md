import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<!-- import { MultiDimensionalContentWidget } from '@site/src/components/MultiDimensionalContentWidget.js'; -->

<!-- <MultiDimensionalContentWidget /> -->

<!-- <div className='quickstart-tabs'> -->

<!-- todo: end the annoyance of this file not being clearly tightly coupled to the MultiDimensionalContentWidget.js file that lives somewhere else; probably move this file next to that other file -->


import InfoRollupChainPartial from './_info-rollup-chain-partial.md';

import InfoAnytrustChainPartial from './_info-anytrust-chain-partial.md';

import InfoCustomTokenChainPartial from './_info-custom-token-chain-partial.md';

<Tabs>
  <TabItem value="rollup-chain" label="Rollup chain">
    <InfoRollupChainPartial/>
  </TabItem>
  <TabItem value="anytrust-chain" label="AnyTrust chain">
    <InfoAnytrustChainPartial/>
  </TabItem>
  <TabItem value="custom-token-chain" label="Custom token chain">
    <InfoCustomTokenChainPartial/>
</TabItem>
</Tabs>

