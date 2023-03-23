import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<div class='hide-tabs'>
    <div class='checklist'>
        <div class='task'>
            <div class='input-container'><input id="tc-1" type='checkbox'/><span class='done'></span></div>
            <div class='guidance-container'>
                <label for="tc-1">1. Follow our node running guidance.</label>
                <p>Many common issues are resolved by the steps in our <a target="_blank">TODO</a> how-to guide. We recommend following this guide before proceeding here.</p>
            </div>
        </div>
        <div class='task'>
            <div class='input-container'><input id="tc-2" type='checkbox'/><span class='done'></span></div>
            <div class='guidance-container'>
                <label for="tc-2">2. Select a configuration above</label>
                <p>If you end up generating a troubleshooting report, your report will include your selected configuration.</p>
            </div>
        </div>
        <div class='task'>
            <div class='input-container'><input id="st-1" type='checkbox'/><span class='done'></span></div>
            <div class='guidance-container'>
                <label for="st-1">3. TODO</label>
                <p>
                <Tabs groupId="execution-clients" defaultValue="geth" values={[
                {label: 'Execution client:', value: 'label'},
                {label: 'Nethermind', value: 'nethermind'},
                {label: 'Besu', value: 'besu'},
                {label: 'Geth', value: 'geth'}
                ]}>
                <TabItem value="nethermind">
                    <p>Demo - nethermind</p>
                </TabItem>
                <TabItem value="besu">
                    <Tabs className="tabgroup-with-label" groupId="os" defaultValue="others" values={[
                        {label: 'Operating system:', value: 'label'},
                        {label: 'Linux, MacOS, Arm64', value: 'others'},
                        {label: 'Windows', value: 'win'}
                        ]}>
                        <TabItem className="unclickable-element" value="label"></TabItem>
                        <TabItem value="others"><p>Demo - besu - others</p></TabItem>
                        <TabItem value="win"><p>Demo - besu - windows</p></TabItem>
                    </Tabs>
                </TabItem>
                <TabItem value="geth">
                    <Tabs className="tabgroup-with-label" groupId="os" defaultValue="others" values={[
                        {label: 'Operating system:', value: 'label'},
                        {label: 'Linux, MacOS, Arm64', value: 'others'},
                        {label: 'Windows', value: 'win'}
                        ]}>
                        <TabItem className="unclickable-element" value="label"></TabItem>
                        <TabItem value="others"><p>Demo - geth - others</p></TabItem>
                        <TabItem value="win"><p>Demo - geth - windows</p></TabItem>
                    </Tabs>
                </TabItem>
                </Tabs>
                </p>
            </div>
        </div>
        <div class='task hidden-in-status-guide'>
            <div class='input-container'><input id="st-10" type='checkbox'/><span class='done'></span></div>
            <div class='guidance-container'>
                <label for="st-10">12. Troubleshooting scenarios and solutions</label>
                <p>Running into unexpected output, warnings, or errors? Although this is unintuitive, <strong>many errors and warnings are expected</strong> and have been identified in the below list of troubleshooting scenarios and solutions. We gratefully ask that you review this before asking for support.</p>
            </div>
        </div>
        <div class='task hidden-in-status-guide'>
            <div class='input-container'><input id="st-11" type='checkbox'/><span class='done'></span></div>
            <div class='guidance-container'>
                <label for="st-11">13. Troubleshooting report</label>
                <p>Issue still not resolved? <a href='#generate-troubleshooting-report'>Generate a troubleshooting report below</a>. Head over to <a href='https://discord.gg/ZpZuw7p'>Discord</a> and paste your report for additional troubleshooting assistance.</p>
            </div>
        </div>
    </div>
</div>