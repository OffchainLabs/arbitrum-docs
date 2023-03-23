import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import {MultiDimensionalContentWidget} from '@site/src/components/MultiDimensionalContentWidget.js';

<MultiDimensionalContentWidget />

<div class='quickstart-tabs'>

<Tabs className="tabgroup-with-label os-tabgroup" groupId="os" defaultValue="others" values={[
    {label: 'Operating system:', value: 'label'},
    {label: 'Linux, MacOS, Arm64', value: 'others'},
    {label: 'Windows', value: 'win'}
]}>
  <TabItem className="unclickable-element" value="label"></TabItem>
  <TabItem value="others"></TabItem>
  <TabItem value="win"></TabItem>
</Tabs>

<Tabs className="tabgroup-with-label network-tabgroup" groupId="network" defaultValue="mainnet" values={[
        {label: 'Network:', value: 'label'},
        {label: 'Mainnet', value: 'mainnet'},
        {label: 'Goerli-Prater', value: 'goerli-prater'},
        {label: 'Sepolia', value: 'sepolia'},
        {label: 'Ropsten', value: 'ropsten'}
    ]}>
    <TabItem className="unclickable-element" value="label"></TabItem>
    <TabItem value="mainnet"></TabItem>
    <TabItem value="goerli-prater"></TabItem>
    <TabItem value="sepolia"></TabItem>
    <TabItem value="ropsten"></TabItem>
</Tabs>

<Tabs className="tabgroup-with-label hidden-in-docker-guide el-tabgroup" groupId="execution-clients" defaultValue="geth" values={[
  {label: 'Execution client:', value: 'label'},
  {label: 'Geth', value: 'geth'},
  {label: 'Nethermind', value: 'nethermind'},
  {label: 'Besu', value: 'besu'}
  ]}>
  <TabItem className="unclickable-element" value="label"></TabItem>
  <TabItem value="geth"></TabItem>
  <TabItem value="nethermind"></TabItem>
  <TabItem value="besu"></TabItem>
</Tabs>

<Tabs className="tabgroup-with-label hidden-in-jwt-guide hidden-in-docker-guide enbn-tabgroup" groupId="protocol" defaultValue="jwt" values={[
        {label: 'EN-BN connection:', value: 'label'},
        {label: 'HTTP-JWT', value: 'jwt'},
        {label: 'IPC', value: 'ipc'}
    ]}>
    <TabItem className="unclickable-element" value="label"></TabItem>
    <TabItem value="jwt"></TabItem>
    <TabItem value="ipc"></TabItem>
</Tabs>

</div>