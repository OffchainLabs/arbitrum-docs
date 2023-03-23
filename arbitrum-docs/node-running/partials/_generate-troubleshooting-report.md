import {GenerateTroubleshootingReportWidget} from '@site/src/components/GenerateTroubleshootingReportWidget.js';

<GenerateTroubleshootingReportWidget />

<div class='troubleshooting-report-area'>
    <p>Validator node startup command</p>
    <textarea id="vn-cmd" rows="3" placeholder='Optional. Paste something like "./prysm.sh validator" (or Docker config) here...'></textarea>
    <p>Unexpected output</p>
    <span><strong>Tip:</strong> Paste the ~100 lines of output before and including the unexpected output you're asking about.</span>
    <textarea id="output" rows="3" placeholder='Paste your unexpected output here...'></textarea>
    <a id='generate-report' class='generate-report'>Generate troubleshooting report</a>
    <div id='generated-report' class='generated-report'>Complete the checklist above before generating...</div>
</div>