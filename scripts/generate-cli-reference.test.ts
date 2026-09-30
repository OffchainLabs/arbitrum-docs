/**
 * Tests for the Nitro CLI flags reader and the page renderer.
 *
 * The fixture is a miniature Go tree written to a temp directory, not a copy of Nitro. It carries
 * one example of each shape the reader has to understand, so a regression shows up as a named
 * failing case rather than as a diff in an 800-row page nobody reads line by line.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

import {
  codeCell,
  escapeCell,
  groupByNamespace,
  renderGeneratedRegion,
  splicePage,
} from './lib/cli-reference-page.ts';
import {
  type GoTree,
  indexGoTree,
  literalFields,
  splitArgs,
  stripComments,
} from './lib/go-source.ts';
import { extractFlags, formatDuration } from './lib/nitro-cli-flags.ts';

const MODULE = 'example.com/fixture';

const FIXTURE = {
  'cmd/config/config.go': `package config

import (
	flag "github.com/spf13/pflag"

	"example.com/fixture/server"
	"example.com/fixture/poster"
)

func NodeConfigAddOptions(f *flag.FlagSet) {
	server.ConfigAddOptions("http", f)
	poster.ConfigAddOptions("node.batch-poster", f, poster.DefaultPosterConfig)
	poster.ConfigAddOptions("node.staker", f, poster.DefaultStakerConfig)
}
`,
  'server/server.go': `package server

import flag "github.com/spf13/pflag"

// A comment with an apostrophe: don't let this swallow the file.
type Config struct {
	Addr string
	Port int
	API  []string
	Idle time.Duration
	TLS  bool
}

var ConfigDefault = Config{
	Addr: "127.0.0.1",
	Port: 8547,
	API:  append([]string{"net"}, "web3", "eth"),
	Idle: 90 * time.Second,
	TLS:  false,
}

const bufferBytes = 4 << 10

var (
	acceptedSnapshotKinds = []string{"archive", "pruned", "genesis"}
	acceptedSnapshotKindsStr = "(accepted values: \\"" + strings.Join(acceptedSnapshotKinds, "\\" | \\"") + "\\")"
)

func ConfigAddOptions(prefix string, f *flag.FlagSet) {
	f.String(prefix+".addr", ConfigDefault.Addr, "listening interface")
	f.Int(prefix+".port", ConfigDefault.Port, "listening port")
	f.StringSlice(prefix+".api", ConfigDefault.API, "APIs offered over "+prefix)
	f.Duration(prefix+".idle", ConfigDefault.Idle, "idle timeout")
	f.Bool(prefix+".tls", ConfigDefault.TLS, "serve over TLS")
	f.Int(prefix+".buffer", bufferBytes, "read buffer size")
	f.Uint64(prefix+".unset", ConfigDefault.Missing, "a field the literal omits")
	f.String(prefix+".latest", "", "searches for the latest snapshot "+acceptedSnapshotKindsStr)
}
`,
  'cmd/config/unfollowable.go': `package config

import (
	flag "github.com/spf13/pflag"

	"example.com/fixture/server"
	"example.com/outside/absent"
)

// Both calls hand over the FlagSet and so register flags, and neither can be followed: the first
// names a package that is not in the tree, the second builds its prefix from a variable.
func UnfollowableAddOptions(f *flag.FlagSet) {
	absent.ConfigAddOptions("node.absent", f)
	server.ConfigAddOptions(chosenPrefix, f)
}
`,
  'poster/poster.go': `package poster

import flag "github.com/spf13/pflag"

var DefaultPosterConfig = PosterConfig{
	MaxDelay: time.Hour,
	Enable:   true,
	Levels:   compressionLevels,
}

// Built by copying the base and tweaking it, which is not a struct literal.
var DefaultStakerConfig = func() PosterConfig {
	config := DefaultPosterConfig
	config.MaxDelay = 30 * time.Minute
	config.Enable = false
	return config
}()

var compressionLevels = CompressionLevelStepList{}

func ConfigAddOptions(prefix string, f *flag.FlagSet, defaultConfig PosterConfig) {
	f.Duration(prefix+".max-delay", defaultConfig.MaxDelay, "how long to wait")
	f.Bool(prefix+".enable", defaultConfig.Enable, "enable posting")
	f.Var(&compressionLevels, prefix+".levels", "JSON array of compression level steps")
}
`,
};

let workDir: string;
let indexed: GoTree;

before(() => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-ref-test-'));
  for (const [rel, source] of Object.entries(FIXTURE)) {
    const abs = path.join(workDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, source);
  }
  indexed = indexGoTree([{ modulePath: MODULE, dir: '', absDir: workDir }]);
});

after(() => fs.rmSync(workDir, { recursive: true, force: true }));

function readFixtureFlags() {
  return extractFlags({
    dirs: indexed.dirs,
    fileImports: indexed.fileImports,
    entryPoint: { dir: 'cmd/config', func: 'NodeConfigAddOptions' },
    customTypes: {
      'node.batch-poster.levels': { type: 'CompressionLevelStepList', default: '[]' },
      'node.staker.levels': { type: 'CompressionLevelStepList', default: '[]' },
    },
  });
}

describe('go-source', () => {
  it('strips comments without letting an apostrophe open a literal', () => {
    const stripped = stripComments("// don't\nvar x = 1\n");
    assert.equal(stripped.trim(), 'var x = 1');
  });

  it('keeps string contents that look like comments', () => {
    assert.equal(stripComments('a := "http://x" // y').trim(), 'a := "http://x"');
  });

  it('splits arguments without breaking on commas inside nesting or strings', () => {
    assert.deepEqual(splitArgs('a, f(b, c), "d, e"'), ['a', 'f(b, c)', '"d, e"']);
  });

  it('reads the fields of a nested composite literal', () => {
    const fields = literalFields('T{A: 1, B: Sub{C: 2, D: 3}}');
    assert.equal(fields.get('A'), '1');
    assert.equal(fields.get('B'), 'Sub{C: 2, D: 3}');
  });
});

describe('formatDuration', () => {
  const cases: Array<[number, string]> = [
    [0, '0s'],
    [500, '500ns'],
    [1_500_000, '1.5ms'],
    [1_000_000_000, '1s'],
    [90_000_000_000, '1m30s'],
    [1_800_000_000_000, '30m0s'],
    [3_600_000_000_000, '1h0m0s'],
  ];
  for (const [ns, expected] of cases) {
    it(`formats ${ns}ns as ${expected}`, () => assert.equal(formatDuration(ns), expected));
  }
});

describe('extractFlags', () => {
  it('reads every flag with no unresolved expressions', () => {
    const { flags, problems } = readFixtureFlags();
    assert.deepEqual(problems, []);
    assert.equal(flags.length, 14);
  });

  it('composes dotted names from the prefix each caller passes', () => {
    const { flags } = readFixtureFlags();
    const names = flags.map((f) => f.flag);
    assert.ok(names.includes('http.addr'));
    assert.ok(names.includes('node.batch-poster.max-delay'));
    assert.ok(names.includes('node.staker.max-delay'));
  });

  it('maps pflag registration methods to the type names --help prints', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(byFlag['http.addr'].type, 'string');
    assert.equal(byFlag['http.port'].type, 'int');
    assert.equal(byFlag['http.api'].type, 'strings');
    assert.equal(byFlag['http.idle'].type, 'duration');
    assert.equal(byFlag['http.unset'].type, 'uint');
  });

  it('resolves defaults through struct literals, append, shifts and durations', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(byFlag['http.addr'].default, '127.0.0.1');
    assert.equal(byFlag['http.port'].default, '8547');
    assert.equal(byFlag['http.api'].default, '[net,web3,eth]');
    assert.equal(byFlag['http.idle'].default, '1m30s');
    assert.equal(byFlag['http.buffer'].default, '4096');
  });

  it('renders a zero value as an empty default, the way pflag omits it', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(byFlag['http.tls'].default, '');
    assert.equal(byFlag['http.unset'].default, '');
  });

  it('binds a registration function to the defaults each caller hands it', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(byFlag['node.batch-poster.max-delay'].default, '1h0m0s');
    assert.equal(byFlag['node.batch-poster.enable'].default, 'true');
  });

  it('follows a defaults struct built by a closure rather than a literal', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(byFlag['node.staker.max-delay'].default, '30m0s');
    assert.equal(byFlag['node.staker.enable'].default, '');
  });

  it('joins a usage string that concatenates the prefix', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(byFlag['http.api'].description, 'APIs offered over http');
  });

  it('resolves a usage string built from strings.Join and a package-level slice', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(
      byFlag['http.latest'].description,
      'searches for the latest snapshot (accepted values: "archive" | "pruned" | "genesis")',
    );
  });

  it('takes the type and default of an f.Var flag from the overrides', () => {
    const byFlag = Object.fromEntries(readFixtureFlags().flags.map((f) => [f.flag, f]));
    assert.equal(byFlag['node.staker.levels'].type, 'CompressionLevelStepList');
    assert.equal(byFlag['node.staker.levels'].default, '[]');
  });

  it('reports an f.Var flag that has no override instead of publishing a blank type', () => {
    const { problems } = extractFlags({
      dirs: indexed.dirs,
      fileImports: indexed.fileImports,
      entryPoint: { dir: 'cmd/config', func: 'NodeConfigAddOptions' },
    });
    assert.equal(problems.length, 2);
    assert.match(problems[0], /has no entry in customFlagTypes/);
  });

  it('reports a customFlagTypes entry that matches no flag rather than letting it rot', () => {
    const { problems } = extractFlags({
      dirs: indexed.dirs,
      fileImports: indexed.fileImports,
      entryPoint: { dir: 'cmd/config', func: 'NodeConfigAddOptions' },
      customTypes: {
        'node.batch-poster.levels': { type: 'CompressionLevelStepList', default: '[]' },
        'node.staker.levels': { type: 'CompressionLevelStepList', default: '[]' },
        'node.retired.levels': { type: 'CompressionLevelStepList', default: '[]' },
      },
    });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /customFlagTypes entry "node\.retired\.levels" .* matched no flag/);
  });

  it('reports a defaultOverrides entry that matches no flag rather than letting it rot', () => {
    const { problems } = extractFlags({
      dirs: indexed.dirs,
      fileImports: indexed.fileImports,
      entryPoint: { dir: 'cmd/config', func: 'NodeConfigAddOptions' },
      customTypes: {
        'node.batch-poster.levels': { type: 'CompressionLevelStepList', default: '[]' },
        'node.staker.levels': { type: 'CompressionLevelStepList', default: '[]' },
      },
      defaultOverrides: { 'node.gone.threads': 'GOMAXPROCS' },
    });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /defaultOverrides entry "node\.gone\.threads" .* matched no flag/);
  });

  it('accepts an override for a flag the caller later excludes from the page', () => {
    // `defaultOverrides` declares `blocks-reexecutor.room`, which the blocks-reexecutor exclusion
    // rule keeps off the published page. The check runs against the flags as collected, so a live
    // entry for an about-to-be-excluded flag must not be reported as unused.
    const { flags, problems } = extractFlags({
      dirs: indexed.dirs,
      fileImports: indexed.fileImports,
      entryPoint: { dir: 'cmd/config', func: 'NodeConfigAddOptions' },
      customTypes: {
        'node.batch-poster.levels': { type: 'CompressionLevelStepList', default: '[]' },
        'node.staker.levels': { type: 'CompressionLevelStepList', default: '[]' },
      },
      defaultOverrides: { 'node.batch-poster.max-delay': 'GOMAXPROCS' },
    });
    assert.deepEqual(problems, []);
    const overridden = flags.find((flag) => flag.flag === 'node.batch-poster.max-delay');
    assert.equal(overridden?.default, 'GOMAXPROCS');
  });

  it('reports a registration call it cannot follow instead of dropping the namespace', () => {
    const { flags, problems } = extractFlags({
      dirs: indexed.dirs,
      fileImports: indexed.fileImports,
      entryPoint: { dir: 'cmd/config', func: 'UnfollowableAddOptions' },
    });
    assert.deepEqual(flags, []);
    assert.equal(problems.length, 2);
    assert.match(problems[0], /absent\.ConfigAddOptions .* resolves to no indexed package/);
  });

  it('reports a prefix it cannot read instead of dropping the namespace', () => {
    const { problems } = extractFlags({
      dirs: indexed.dirs,
      fileImports: indexed.fileImports,
      entryPoint: { dir: 'cmd/config', func: 'UnfollowableAddOptions' },
    });
    assert.match(problems[1], /unreadable prefix chosenPrefix for ConfigAddOptions/);
  });

  it('reports a missing entry point rather than returning nothing', () => {
    const { problems } = extractFlags({
      dirs: indexed.dirs,
      fileImports: indexed.fileImports,
      entryPoint: { dir: 'cmd/config', func: 'MovedAwayAddOptions' },
    });
    assert.match(problems[0], /flag function cmd\/config\.MovedAwayAddOptions not found/);
  });
});

describe('page rendering', () => {
  const flags = [
    { flag: 'http.addr', type: 'string', default: '127.0.0.1', description: 'listening interface' },
    { flag: 'http.tls', type: 'bool', default: '', description: 'serve over TLS' },
    { flag: 'node.enable', type: 'bool', default: 'true', description: 'a|b <c> {d}' },
    {
      flag: 'node.levels',
      type: 'CompressionLevelStepList',
      default: '[{"backlog":0}] <?x?> a|b',
      description: 'JSON array',
    },
  ];
  const options = {
    introLinks: [
      { label: 'Configuration system', href: '/docs/x' },
      { label: 'DA tools reference', href: '/docs/da' },
    ],
    namespaceLinks: { http: { label: 'Configuration system', href: '/docs/x' } },
    defaultNamespaceLink: { label: 'Fallback', href: '/docs/y' },
    nitroVersionTag: 'v9.9.9',
  };

  it('groups flags by their first dotted segment, alphabetically', () => {
    assert.deepEqual(
      groupByNamespace(flags).map((g) => `${g.namespace}:${g.flags.length}`),
      ['http:2', 'node:2'],
    );
  });

  it('escapes the characters that would break a table row or the MDX parse', () => {
    assert.equal(escapeCell('a|b <c> {d}'), 'a\\|b &lt;c&gt; \\{d\\}');
  });

  it('escapes only the pipe inside a code span, where the rest would be literal text', () => {
    assert.equal(codeCell('a|b <c> {d}'), '`a\\|b <c> {d}`');
  });

  it('widens the fence around a value that contains backticks', () => {
    assert.equal(codeCell('a`b'), '``a`b``');
    assert.equal(codeCell('`x`'), '`` `x` ``');
  });

  it('renders a default with braces and angle brackets as the reader must type it', () => {
    const out = renderGeneratedRegion(flags, options);
    assert.ok(out.includes('`[{"backlog":0}] <?x?> a\\|b`'));
    assert.ok(!out.includes('&lt;?x?&gt;'));
    assert.ok(!out.includes('\\{"backlog"'));
  });

  it('escapes the type column too, so a custom pflag type cannot break the row', () => {
    const out = renderGeneratedRegion(
      [{ flag: 'a.b', type: 'weird|type', default: '', description: 'd' }],
      options,
    );
    assert.ok(out.includes('| `a.b` | weird\\|type | - | d |'));
  });

  it('renders an empty default as a dash', () => {
    const out = renderGeneratedRegion(flags, options);
    assert.match(out, /\| `http\.tls` \| bool \| - \| serve over TLS \|/);
  });

  it('reports the flag count and the Nitro tag it read', () => {
    const out = renderGeneratedRegion(flags, options);
    assert.match(out, /\*\*Total flags:\*\* 4 across 2 namespaces, read from Nitro `v9\.9\.9`\./);
  });

  it('falls back to the default guide link for an unlisted namespace', () => {
    const out = renderGeneratedRegion(flags, options);
    assert.match(out, /Related guide: \[Fallback\]\(\/docs\/y\)/);
  });

  it('lists the curated intro guides, including one that is no namespace', () => {
    const out = renderGeneratedRegion(flags, options);
    assert.ok(out.includes('- [Configuration system](/docs/x)\n- [DA tools reference](/docs/da)'));
  });

  it('keeps the existing frontmatter and the prose outside the markers', () => {
    const existing = [
      '---',
      "title: 'CLI flags reference'",
      'author: someone',
      '---',
      '',
      'Hand-written intro.',
      '',
      '{/* GENERATED:START */}',
      '',
      'old tables',
      '',
      '{/* GENERATED:END */}',
      '',
      'Hand-written outro.',
      '',
    ].join('\n');

    const out = splicePage(existing, 'new tables');
    assert.match(out, /^---\ntitle: 'CLI flags reference'\nauthor: someone\n---\n/);
    assert.ok(out.includes('Hand-written intro.'));
    assert.ok(out.includes('Hand-written outro.'));
    assert.ok(out.includes('new tables'));
    assert.ok(!out.includes('old tables'));
  });

  it('refuses to rewrite an existing page whose markers are damaged', () => {
    const existing = [
      '---',
      'title: t',
      '---',
      '',
      'Prose a writer owns.',
      '',
      'old tables',
      '',
    ].join('\n');
    assert.throws(() => splicePage(existing, 'new tables'), /no usable .* pair/);
    assert.throws(
      () => splicePage(existing.replace('old tables', '{/* GENERATED:START */}'), 'new tables'),
      /no usable .* pair/,
    );
  });

  it('writes a full scaffold when the page does not exist yet', () => {
    const out = splicePage('', 'tables');
    assert.match(out, /^---\ntitle: 'CLI flags reference'/);
    assert.ok(out.includes('content_type: '));
    assert.ok(out.includes('{/* GENERATED:START */}'));
    assert.ok(out.includes('{/* GENERATED:END */}'));
  });
});
