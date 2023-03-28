import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import {MultiDimensionalContentWidget} from '@site/src/components/MultiDimensionalContentWidget.js';

<MultiDimensionalContentWidget />

<!-- todo: end the annoyance of this file not being clearly tightly coupled to the MultiDimensionalContentWidget.js file that lives somewhere else; probably move it next to that other file -->

<div className='dynamic-content-tabs'>
<Tabs className="tabgroup-with-label os-tabgroup" groupId="os" defaultValue="others" values={[
    {label: 'Operating system:', value: 'label'},
    {label: 'Linux, MacOS, Arm64', value: 'others'},
    {label: 'Windows', value: 'win'}
]}>
  <TabItem className="unclickable-element" value="label"></TabItem>
  <TabItem value="others"></TabItem>
  <TabItem value="win"></TabItem>
</Tabs>

<Tabs className="tabgroup-with-label network-tabgroup" groupId="network" defaultvalue="arb-one" values={[
        {label: 'Network:', value: 'label'},
        {label: 'Localhost', value: 'localhost'},
        {label: 'Arbitrum Goerli', value: 'arb-goerli'},
        {label: 'Arbitrum One', value: 'arb-one'},
        {label: 'Arbitrum Nova', value: 'arb-nova'}
    ]}>
    <TabItem className="unclickable-element" value="label"></TabItem>
    <TabItem value="localhost"></TabItem>
    <TabItem value="arb-goerli"></TabItem>
    <TabItem value="arb-one"></TabItem>
    <TabItem value="arb-nova"></TabItem>
    
</Tabs>
</div>