import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import { MultiDimensionalContentWidget } from '@site/src/components/MultiDimensionalContentWidget.js';

<MultiDimensionalContentWidget />

<!-- todo: end the annoyance of this file not being clearly tightly coupled to the MultiDimensionalContentWidget.js file that lives somewhere else; probably move this file next to that other file -->

<div className='dynamic-content-tabs'>
  <Tabs className="tabgroup-with-label" groupId="chain-type" defaultValue="rollup-chain" values={[
    {label: '', value: 'label'},
    {label: 'Rollup chain', value: 'rollup-chain'},
    {label: 'AnyTrust chain', value: 'anytrust-chain'},
    {label: 'Custom token chain', value: 'custom-token-chain'}
  ]}>
    <TabItem className="unclickable-element" value="label"></TabItem>
    <TabItem value="rollup-chain'"></TabItem>
    <TabItem value="anytrust-chain'"></TabItem>
    <TabItem value="custom-token-chain"></TabItem>
  </Tabs>

</div>
