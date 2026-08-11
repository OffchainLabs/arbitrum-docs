/**
 * Generates the Nitro CLI flags reference page from structured flag data.
 *
 * Usage:
 *   tsx scripts/generate-cli-reference.ts
 *   tsx scripts/generate-cli-reference.ts --check
 *   tsx scripts/generate-cli-reference.ts --output path/to/output.mdx
 *   tsx scripts/generate-cli-reference.ts --nitro-path ../nitro
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

interface CliFlag {
  flag: string;
  type: string;
  default: string;
  description: string;
}

interface NamespaceGroup {
  namespace: string;
  flags: CliFlag[];
}

const DEFAULT_OUTPUT = 'docs/run-arbitrum-node/nitro/cli-flags-reference.mdx';
const DATA_FILE = 'scripts/data/nitro-cli-flags.json';

/**
 * Map top-level namespaces to related curated guide pages.
 * Namespaces not listed here get the generic configuration-system link.
 */
const NAMESPACE_LINKS: Record<string, { label: string; href: string }> = {
  'execution': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
  'node': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
  'validation': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
  'init': {
    label: 'Docker and CLI binaries',
    href: '/run-arbitrum-node/nitro/docker-and-cli-binaries',
  },
  'persistent': {
    label: 'Docker and CLI binaries',
    href: '/run-arbitrum-node/nitro/docker-and-cli-binaries',
  },
  'parent-chain': {
    label: 'Configuration system',
    href: '/run-arbitrum-node/nitro/configuration-system',
  },
  'chain': {
    label: 'Configuration system',
    href: '/run-arbitrum-node/nitro/configuration-system',
  },
  'conf': {
    label: 'Configuration system',
    href: '/run-arbitrum-node/nitro/configuration-system',
  },
  'http': {
    label: 'Configuration system',
    href: '/run-arbitrum-node/nitro/configuration-system',
  },
  'ws': {
    label: 'Configuration system',
    href: '/run-arbitrum-node/nitro/configuration-system',
  },
  'auth': {
    label: 'Configuration system',
    href: '/run-arbitrum-node/nitro/configuration-system',
  },
  'metrics': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
  'metrics-server': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
  'pprof': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
  'pprof-cfg': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
  'file-logging': {
    label: 'Node tuning and monitoring',
    href: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
  },
};

const DEFAULT_LINK = {
  label: 'Configuration system',
  href: '/run-arbitrum-node/nitro/configuration-system',
};

function parseArgs(): { check: boolean; output: string; nitroPath: string } {
  const args = process.argv.slice(2);
  let check = false;
  let output = DEFAULT_OUTPUT;
  let nitroPath = process.env.NITRO_REPO_PATH ?? '../nitro';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check') {
      check = true;
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[++i];
    } else if (args[i] === '--nitro-path' && args[i + 1]) {
      nitroPath = args[++i];
    }
  }

  return { check, output, nitroPath };
}

function loadFlags(): CliFlag[] {
  const dataPath = path.resolve(process.cwd(), DATA_FILE);
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Flag data file not found: ${dataPath}`);
  }
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw) as CliFlag[];
}

interface ExclusionRule {
  reason: string;
  matches: (flag: CliFlag) => boolean;
}

/**
 * Flags omitted from the generated reference. Each rule documents why its
 * matched flags are excluded. Add an entry here to exclude more flags.
 */
const EXCLUSIONS: ExclusionRule[] = [
  {
    reason:
      'dangerous: flags under a `dangerous` namespace segment (superset of "DANGEROUS!" descriptions)',
    matches: (flag) => /(^|\.)dangerous(\.|$)/.test(flag.flag),
  },
  {
    reason: 'experimental: marked experimental by flag name or description',
    matches: (flag) => /experimental/i.test(flag.flag) || /experimental/i.test(flag.description),
  },
  {
    reason: 'blocks-reexecutor: block re-execution tooling namespace',
    matches: (flag) => /(^|\.)blocks-reexecutor(\.|$)/.test(flag.flag),
  },
  {
    reason: 'conf.reload-interval: periodic config reload knob',
    matches: (flag) => flag.flag === 'conf.reload-interval',
  },
];

function isExcluded(flag: CliFlag): boolean {
  return EXCLUSIONS.some((rule) => rule.matches(flag));
}

function groupByNamespace(flags: CliFlag[]): NamespaceGroup[] {
  const groups = new Map<string, CliFlag[]>();

  for (const flag of flags) {
    const dotIdx = flag.flag.indexOf('.');
    const namespace = dotIdx === -1 ? flag.flag : flag.flag.slice(0, dotIdx);

    if (!groups.has(namespace)) {
      groups.set(namespace, []);
    }
    groups.get(namespace)!.push(flag);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([namespace, nsFlags]) => ({ namespace, flags: nsFlags }));
}

function escapeMarkdownTable(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function formatDefault(value: string): string {
  if (value === '') return '-';
  return `\`${escapeMarkdownTable(value)}\``;
}

function generateMdx(groups: NamespaceGroup[]): string {
  const totalFlags = groups.reduce((sum, g) => sum + g.flags.length, 0);
  const lines: string[] = [];

  lines.push(`---
title: 'CLI flags reference'
sidebar_label: 'CLI flags reference'
description: 'Complete reference of all Nitro node command-line flags with types, defaults, and descriptions'
user_story: 'As a node operator, I want a single page where I can look up any Nitro CLI flag'
content_type: 'reference'
author: 'gzeoneth'
sme: 'gzeoneth'
# Content gap tracking:
# - TW-693: Nitro CLI reference (primary deliverable)
---

import { VanillaAdmonition } from '@site/src/components/VanillaAdmonition/';

{/* This page is auto-generated by scripts/generate-cli-reference.ts. Do not edit manually. */}

<VanillaAdmonition type="info" title="Auto-generated reference">

This page lists every CLI flag accepted by the Nitro node binary. For explanations, examples, and recommended configurations, see the curated guides:

- [Configuration system](/run-arbitrum-node/nitro/configuration-system)
- [Docker and CLI binaries](/run-arbitrum-node/nitro/docker-and-cli-binaries)
- [Node tuning and monitoring](/run-arbitrum-node/nitro/node-tuning-and-monitoring)
- [DA tools reference](/run-arbitrum-node/nitro/da-tools-reference)

**Total flags:** ${totalFlags} across ${groups.length} namespaces.

</VanillaAdmonition>

Pass flags on the command line with \`--\` prefix:

\`\`\`shell
nitro --http.addr=0.0.0.0 --http.port=8547 --node.feed.input.url=wss://arb1.arbitrum.io/feed
\`\`\`

Or set them in a JSON configuration file:

\`\`\`shell
nitro --conf.file=/path/to/config.json
\`\`\`
`);

  for (const group of groups) {
    const link = NAMESPACE_LINKS[group.namespace] ?? DEFAULT_LINK;

    lines.push(`## ${group.namespace}
`);
    lines.push(`Related guide: [${link.label}](${link.href})`);
    lines.push('');
    lines.push('<details>');
    lines.push(`<summary>${group.namespace} flags (${group.flags.length})</summary>`);
    lines.push('');
    lines.push('| Flag | Type | Default | Description |');
    lines.push('|------|------|---------|-------------|');

    for (const flag of group.flags) {
      const escapedDesc = escapeMarkdownTable(flag.description);
      const escapedFlag = escapeMarkdownTable(flag.flag);
      const defaultStr = formatDefault(flag.default);
      lines.push(`| \`${escapedFlag}\` | ${flag.type} | ${defaultStr} | ${escapedDesc} |`);
    }

    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  return lines.join('\n');
}

function main(): void {
  const { check, output } = parseArgs();

  const flags = loadFlags().filter((flag) => !isExcluded(flag));
  const groups = groupByNamespace(flags);
  const mdx = generateMdx(groups);

  const outputPath = path.resolve(process.cwd(), output);

  if (check) {
    if (!fs.existsSync(outputPath)) {
      console.error(`Check failed: output file does not exist at ${outputPath}`);
      process.exit(1);
    }
    const existing = fs.readFileSync(outputPath, 'utf8');

    // Write to a temp file and run Prettier so the comparison accounts
    // for table padding, asterisk escaping, and other formatting changes
    // that Prettier applies to markdown tables.
    const tmpPath = path.join(path.dirname(outputPath), '.cli-flags-check-tmp.mdx');
    try {
      fs.writeFileSync(tmpPath, mdx);
      execSync(`npx prettier --write --config ./.prettierrc.js "${tmpPath}"`, {
        stdio: 'pipe',
      });
      const formatted = fs.readFileSync(tmpPath, 'utf8');
      if (existing !== formatted) {
        console.error('Check failed: generated output differs from committed file.');
        console.error('Run "yarn generate-cli-reference" to update.');
        process.exit(1);
      }
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
    console.log('Check passed: output is up to date.');
    return;
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, mdx);
  console.log(`Generated ${outputPath}`);
  console.log(`  ${flags.length} flags in ${groups.length} namespaces`);
}

main();
