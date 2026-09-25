/**
 * Editorial inputs for `scripts/generate-cli-reference.ts`: which flags to publish, where each
 * namespace sends the reader next, and the three flags whose type the Go reader cannot infer.
 *
 * Everything here is a judgement call a writer may want to revisit. The mechanical part (reading
 * flags out of Nitro) lives in `scripts/lib/nitro-cli-flags.ts` and needs no curation.
 *
 * Ported from arbitrum-docs `scripts/generate-cli-reference.ts`, with the hrefs rewritten for
 * this site's `/docs`-prefixed routes.
 */
import type { GuideLink } from '../lib/cli-reference-page.ts';
import type { CliFlag, CustomFlagType, EntryPoint } from '../lib/nitro-cli-flags.ts';

/** A rule keeping flags off the published page, with the reason the generator logs for it. */
export interface ExclusionRule {
  reason: string;
  matches: (flag: CliFlag) => boolean;
}

/** Where the walk over Nitro's flag registrations starts. */
export const entryPoint: EntryPoint = { dir: 'cmd/nitro/config', func: 'NodeConfigAddOptions' };

const CONFIGURATION: GuideLink = {
  label: 'Configuration system',
  href: '/docs/run-a-node/nitro/configuration-system',
};
const BINARIES: GuideLink = {
  label: 'Docker and CLI binaries',
  href: '/docs/run-a-node/nitro/docker-and-cli-binaries',
};
const TUNING: GuideLink = {
  label: 'Node tuning and monitoring',
  href: '/docs/run-a-node/nitro/node-tuning-and-monitoring',
};
const DA_TOOLS: GuideLink = {
  label: 'DA tools reference',
  href: '/docs/run-a-node/nitro/da-tools-reference',
};

/**
 * The guides the page's intro admonition sends the reader to, in order.
 *
 * Not derived from `namespaceLinks` below: this list deliberately includes the DA tools
 * reference, which explains a body of flags without being any single namespace's guide, and
 * derivation would drop it. Keeping it here means every editorial href in the page lives in this
 * file, so a guide that moves is one edit rather than a hunt through the renderer.
 */
export const introLinks: readonly GuideLink[] = [CONFIGURATION, BINARIES, TUNING, DA_TOOLS];

/** Top-level namespace to the curated guide that explains it. */
export const namespaceLinks: Readonly<Record<string, GuideLink>> = {
  'auth': CONFIGURATION,
  'chain': CONFIGURATION,
  'conf': CONFIGURATION,
  'execution': TUNING,
  'file-logging': TUNING,
  'http': CONFIGURATION,
  'init': BINARIES,
  'metrics': TUNING,
  'metrics-server': TUNING,
  'node': TUNING,
  'parent-chain': CONFIGURATION,
  'persistent': BINARIES,
  'pprof': TUNING,
  'pprof-cfg': TUNING,
  'validation': TUNING,
  'ws': CONFIGURATION,
};

/** Namespaces with no entry above land here. */
export const defaultNamespaceLink: GuideLink = CONFIGURATION;

/**
 * Flags kept out of the published reference. Each rule carries its reason, because "why is this
 * flag missing" is the question a reader asks and the generator is the only place with an answer.
 */
export const exclusions: readonly ExclusionRule[] = [
  {
    reason: 'dangerous: anything under a `dangerous` namespace segment',
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

/**
 * Flags registered with `f.Var` and a custom `pflag.Value`.
 *
 * Their type name and default string come from methods on a Go type, not from the registration
 * call, so the Go reader cannot derive them. Declaring them here keeps the generator honest: a
 * new `f.Var` flag with no entry fails the run rather than appearing with a blank type.
 *
 * Values below are the `Type()` and `String()` results of those Value implementations at the
 * pinned Nitro tag.
 */
export const customFlagTypes: Readonly<Record<string, CustomFlagType>> = {
  'node.batch-poster.compression-levels': {
    type: 'CompressionLevelStepList',
    default: '[{"backlog":0,"level":11,"recompression-level":11}]',
  },
  'node.data-availability.rpc-aggregator.backends': { type: 'backendConfigList', default: 'null' },
  'node.da.anytrust.rpc-aggregator.backends': { type: 'backendConfigList', default: 'null' },
};

/**
 * Defaults that are not a static value in the source.
 *
 * Each of these is `util.GoMaxProcs()`, which is `runtime.GOMAXPROCS(-1)`: the number of cores
 * the node is allowed to use, decided when the process starts. arbitrum-docs publishes whatever
 * number the machine that ran `nitro --help` happened to have (2, and 4 for the doubled one),
 * which reads as a protocol constant and is not one. Naming the symbol is the honest answer, and
 * the generator fails if one of these flags disappears, so the list cannot rot silently.
 */
export const defaultOverrides: Readonly<Record<string, string>> = {
  'blocks-reexecutor.room': 'GOMAXPROCS',
  'execution.tx-indexer.threads': 'GOMAXPROCS',
  'init.prune-threads': 'GOMAXPROCS',
  'node.block-validator.prerecorded-blocks': '2 x GOMAXPROCS',
  'persistent.pebble.max-concurrent-compactions': 'GOMAXPROCS',
};
