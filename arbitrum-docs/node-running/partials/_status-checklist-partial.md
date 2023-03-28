import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<div className='hide-tabs'>
    <div className='checklist'>
        <div className='task'>
            <div className='input-container'><input id="tc-1" type='checkbox'/><span className='done'></span></div>
            <div className='guidance-container'>
                <label htmlFor="tc-1">1. Follow our node running guidance.</label>
                <p>Many common issues are resolved by the steps in our <a target="_blank">TODO</a> how-to guide. We recommend following this guide before proceeding here.</p>
            </div>
        </div>
        <div className='task'>
            <div className='input-container'><input id="tc-2" type='checkbox'/><span className='done'></span></div>
            <div className='guidance-container'>
                <label htmlFor="tc-2">2. Select a configuration above</label>
                <p>If you end up generating a troubleshooting report, your report will include your selected configuration.</p>
            </div>
        </div>
        <div className='task'>
            <div className='input-container'><input id="st-1" type='checkbox'/><span className='done'></span></div>
            <div className='guidance-container'>
                <label htmlFor="st-1">3. TODO - this changes with the OS</label>
                <Tabs className="tabgroup-with-label" groupId="os" defaultValue="others" values={[
                    {label: 'Operating system:', value: 'label'},
                    {label: 'Linux, MacOS, Arm64', value: 'others'},
                    {label: 'Windows', value: 'win'}
                    ]}>
                    <TabItem className="unclickable-element" value="label"></TabItem>
                    <TabItem value="others"><p>Demo -  others</p></TabItem>
                    <TabItem value="win"><p>Demo -  windows</p></TabItem>
                </Tabs>
            </div>
        </div>
        <div className='task'>
            <div className='input-container'><input id="st-2" type='checkbox'/><span className='done'></span></div>
            <div className='guidance-container'>
                <label htmlFor="st-2">4. TODO - this changes with the network</label>
                <Tabs className="tabgroup-with-label network-tabgroup" groupId="network" defaultvalue="arb-one" values={[   {label: 'Network:', value: 'label'},
                            {label: 'Localhost', value: 'localhost'},
                            {label: 'Arbitrum Goerli', value: 'arb-goerli'},
                            {label: 'Arbitrum One', value: 'arb-one'},
                            {label: 'Arbitrum Nova', value: 'arb-nova'}
                        ]}>
                    <TabItem className="unclickable-element" value="label"></TabItem>
                    <TabItem value="localhost"><p>Demo -  localhost</p></TabItem>
                    <TabItem value="arb-goerli"><p>Demo -  goerli</p></TabItem>
                    <TabItem value="arb-one"><p>Demo -  one</p></TabItem>
                    <TabItem value="arb-nova"><p>Demo -  nova</p></TabItem>
                </Tabs>
            </div>
        </div>
    </div>
</div>