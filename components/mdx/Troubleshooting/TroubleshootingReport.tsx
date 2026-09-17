'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';

import {
  NETWORK_OPTIONS,
  NODE_TYPE_OPTIONS,
  OS_OPTIONS,
  labelOf,
  useTroubleshooting,
} from './store';

/**
 * Step 3: build a plain-text troubleshooting report from the page state.
 *
 * The report text intentionally keeps the Docusaurus format (same headings, same `---------`
 * separators, same ✓/✗ marks) so support channels see exactly what they saw before.
 */

const PLACEHOLDER = 'Complete the checklist above before generating...';

export function TroubleshootingReport() {
  const { os, network, nodeType, checklist, labels } = useTroubleshooting();
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(): void {
    const lines = [
      'Troubleshooting report',
      '---------',
      `Operating system: ${labelOf(OS_OPTIONS, os)}`,
      `Network: ${labelOf(NETWORK_OPTIONS, network)}`,
      `Node type: ${labelOf(NODE_TYPE_OPTIONS, nodeType)}`,
      '---------',
      'Checklist:',
    ];
    // Object key order is registration order, which is the order the items appear on the page.
    for (const [id, label] of Object.entries(labels)) {
      lines.push(`${label} ${checklist[id] ? '✓' : '✗'}`);
    }
    lines.push('---------');
    if (command.trim()) lines.push(`Node command: ${command}`);
    if (output.trim()) {
      lines.push('---------');
      lines.push(`Unexpected output: ${output}`);
    }
    setReport(lines.join('\n'));
    setCopied(false);
  }

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied permission): the text stays selectable.
    }
  }

  return (
    <div className="not-prose my-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ts-command" className="text-sm font-semibold">
          Node startup command (make sure to remove any sensitive information like, i.e., private
          keys)
        </label>
        <textarea
          id="ts-command"
          rows={3}
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder='Paste here the command you use to run your node: "docker run ..."'
          className="w-full rounded-md border border-fd-border bg-fd-muted p-3 font-mono text-sm text-fd-foreground placeholder:text-fd-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ts-output" className="text-sm font-semibold">
          Unexpected output
        </label>
        <p className="mb-0 text-sm text-fd-muted-foreground">
          <strong>Tip:</strong> Paste the ~100 lines of output <strong>before and including</strong>{' '}
          the unexpected output you&apos;re asking about. You can use the following command to get
          the logs: <code>docker logs --tail 100 YOUR_CONTAINER_ID</code>
        </p>
        <textarea
          id="ts-output"
          rows={6}
          value={output}
          onChange={(event) => setOutput(event.target.value)}
          placeholder="Paste your unexpected output here..."
          className="w-full rounded-md border border-fd-border bg-fd-muted p-3 font-mono text-sm text-fd-foreground placeholder:text-fd-muted-foreground"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          className="cursor-pointer rounded-md bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          Generate troubleshooting report
        </button>
        {report ? (
          <button
            type="button"
            onClick={copy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-fd-border px-3 py-2.5 text-sm transition-colors hover:bg-fd-accent"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied' : 'Copy report'}
          </button>
        ) : null}
      </div>

      <pre
        aria-live="polite"
        className={cn(
          'overflow-x-auto whitespace-pre-wrap rounded-md p-5 text-xs',
          report ? 'bg-fd-foreground text-fd-background' : 'bg-fd-muted text-fd-muted-foreground',
        )}
      >
        {report || PLACEHOLDER}
      </pre>
    </div>
  );
}
