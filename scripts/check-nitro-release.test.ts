import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { URL, fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./check-nitro-release.ts', import.meta.url));
const OLD_SHA = '1'.repeat(40);
const NEW_SHA = '2'.repeat(40);
const OLD_CONTRACTS_SHA = '3'.repeat(40);
const NEW_CONTRACTS_SHA = '4'.repeat(40);
const VARS: Record<string, string> = {
  nitroVersionTag: 'v3.11.3',
  latestNitroNodeImage: 'offchainlabs/nitro-node:v3.11.3-beb2108',
  goEthereumCommit: OLD_SHA,
  nitroContractsCommit: OLD_CONTRACTS_SHA,
  nitroRepositorySlug: 'nitro',
  nitroPathToArbos: 'arbos',
  unrelated: 'preserve me',
};
const LINKED_PAGE =
  '# Page\n' +
  '[link](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/arbos/block_processor.go)\n';

/** What a test can vary about the CLI arguments and the mocked GitHub and Docker Hub responses. */
interface RunOptions {
  args?: string[];
  latest?: string;
  published?: string[];
  sha?: string;
  contractsSha?: string;
  status?: number;
  metadata?: Record<string, unknown>;
  vars?: Record<string, string>;
  images?: Array<{ name: string }>;
  missing?: string[];
  rateLimited?: boolean;
}

// A bump while `releases/latest` still names the pinned tag: any lookup at v3.11.4 proves `--to`
// chose the target, not the latest release.
const BUMP: RunOptions = {
  args: ['--to', 'v3.11.4'],
  latest: VARS.nitroVersionTag,
  published: [VARS.nitroVersionTag, 'v3.11.4'],
};

// Exercise the actual CLI in an isolated content tree, with every network request mocked.
function run(
  t: TestContext,
  {
    args = [],
    latest = 'v3.11.4',
    published = [latest, VARS.nitroVersionTag],
    sha = NEW_SHA,
    contractsSha = OLD_CONTRACTS_SHA,
    status = 200,
    metadata = {},
    vars = VARS,
    images,
    missing = [],
    rateLimited = false,
  }: RunOptions = {},
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nitro-release-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'content'));
  const varsPath = path.join(root, 'content/vars.json');
  const original = JSON.stringify(vars, null, 2) + '\n';
  fs.writeFileSync(varsPath, original);
  const pagePath = path.join(root, 'content/node.mdx');
  fs.writeFileSync(
    pagePath,
    `{/* sync-with-var: latestNitroNodeImage */}\n${VARS.latestNitroNodeImage}\n`,
  );
  const linkedPath = path.join(root, 'content/page.mdx');
  fs.writeFileSync(linkedPath, LINKED_PAGE);
  const requestsPath = path.join(root, 'requests.jsonl');
  const outputPath = path.join(root, 'outputs');
  const responses = {
    latest,
    published,
    submodule: {
      type: 'submodule',
      submodule_git_url: 'https://github.com/OffchainLabs/go-ethereum.git',
      sha,
      ...metadata,
    },
    contracts: {
      type: 'submodule',
      submodule_git_url: 'https://github.com/OffchainLabs/nitro-contracts.git',
      sha: contractsSha,
    },
    status,
    images: images ?? null,
    missing,
    rateLimited,
  };
  const mock = `
    import fs from 'node:fs';
    const data = ${JSON.stringify(responses)};
    globalThis.fetch = async (url) => {
      fs.appendFileSync(${JSON.stringify(requestsPath)}, JSON.stringify(url) + '\\n');
      if (url.endsWith('/releases/latest')) return Response.json({ tag_name: data.latest });
      const release = /\\/releases\\/tags\\/([^/?]+)$/.exec(url);
      if (release) {
        const tag = release[1];
        return data.published.includes(tag)
          ? Response.json({ tag_name: tag })
          : Response.json({ message: 'Not Found' }, { status: 404 });
      }
      if (url.includes('/contents/go-ethereum?ref=')) {
        return Response.json(data.submodule, { status: data.status });
      }
      if (url.includes('/contents/contracts?ref=')) return Response.json(data.contracts);
      const contents = /\\/contents\\/([^?]+)\\?ref=/.exec(url);
      if (contents) {
        const status = data.rateLimited ? 403 : data.missing.includes(contents[1]) ? 404 : 200;
        return Response.json({}, { status });
      }
      if (url.startsWith('https://hub.docker.com/')) {
        const tag = new URL(url).searchParams.get('name');
        return Response.json({ results: data.images ?? [{ name: tag + '-abcdef0' }] });
      }
      throw new Error('Unexpected request: ' + url);
    };
  `;
  const result = spawnSync(
    process.execPath,
    ['--import', `data:text/javascript,${encodeURIComponent(mock)}`, SCRIPT, ...args],
    {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, GITHUB_OUTPUT: outputPath },
    },
  );
  return {
    ...result,
    original,
    raw: fs.readFileSync(varsPath, 'utf8'),
    vars: parseVars(fs.readFileSync(varsPath, 'utf8')),
    page: fs.readFileSync(pagePath, 'utf8'),
    linked: fs.readFileSync(linkedPath, 'utf8'),
    requests: fs.existsSync(requestsPath)
      ? fs
          .readFileSync(requestsPath, 'utf8')
          .trim()
          .split('\n')
          .map((line): string => String(JSON.parse(line)))
      : [],
    outputs: fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '',
  };
}

/** The rewritten vars.json, narrowed to the flat string map every fixture writes. */
function parseVars(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text);
  assert.ok(typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed));
  return Object.fromEntries(Object.entries(parsed));
}

test('default mode reports a newer release without bumping the pin or the image', (t) => {
  const result = run(t, { sha: OLD_SHA });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.vars.nitroVersionTag, 'v3.11.3');
  assert.equal(result.vars.latestNitroNodeImage, VARS.latestNitroNodeImage);
  assert.ok(result.page.includes(VARS.latestNitroNodeImage));
  assert.ok(result.requests.every((url) => new URL(url).hostname !== 'hub.docker.com'));
  assert.match(result.outputs, /newer_release=v3\.11\.4/);
  assert.match(result.stdout, /--to v3\.11\.4/);
  assert.ok(result.requests.some((url) => url.endsWith('contents/arbos?ref=v3.11.3')));
  assert.ok(result.requests.every((url) => !url.includes('?ref=v3.11.4')));
});

for (const latest of ['v3.11.4\nupdates_made=true', 'v3.11.4-rc.1', 'v3.11.4 ']) {
  test(`default mode refuses to pass on a malformed release tag ${JSON.stringify(latest)}`, (t) => {
    const result = run(t, { latest, sha: OLD_SHA });
    // A warning, not a failure, so the rest of the weekly refresh still runs.
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stderr,
      /::warning::.*which is not vX\.Y\.Z; refusing to pass it on as newer_release/,
    );
    assert.doesNotMatch(result.outputs, /newer_release/);
    assert.equal(result.raw, result.original);
  });
}

test('default mode reports a stale submodule pin without writing', (t) => {
  const result = run(t);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.raw, result.original);
  assert.ok(result.page.includes(VARS.latestNitroNodeImage));
  assert.ok(result.requests.some((url) => url.endsWith('go-ethereum?ref=v3.11.3')));
  assert.ok(result.requests.every((url) => new URL(url).hostname !== 'hub.docker.com'));
  assert.match(result.outputs, /updates_made=false/);
  assert.match(result.outputs, /stale_pins=true/);
  assert.match(result.outputs, /newer_release=v3\.11\.4/);
  assert.doesNotMatch(result.outputs, /updated_version/);
  assert.match(result.stdout, /--to v3\.11\.3/);
});

test('default mode with everything current leaves the vars file byte-for-byte unchanged', (t) => {
  const result = run(t, { latest: VARS.nitroVersionTag, sha: OLD_SHA });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, 'updates_made=false\n');
  assert.ok(result.requests.some((url) => url.endsWith('contents/arbos?ref=v3.11.3')));
  assert.ok(
    result.requests.some((url) => url.endsWith('contents/arbos/block_processor.go?ref=v3.11.3')),
  );
});

test('default mode reports a missing submodule pin without writing', (t) => {
  const { goEthereumCommit, ...vars } = VARS;
  const result = run(t, { vars });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.raw, result.original);
  assert.ok(result.page.includes(VARS.latestNitroNodeImage));
  assert.ok(result.requests.some((url) => url.endsWith('go-ethereum?ref=v3.11.3')));
  assert.ok(result.requests.every((url) => new URL(url).hostname !== 'hub.docker.com'));
  assert.match(result.outputs, /updates_made=false/);
  assert.match(result.outputs, /stale_pins=true/);
  assert.match(result.outputs, /newer_release=v3\.11\.4/);
  assert.doesNotMatch(result.outputs, /updated_version/);
  assert.match(result.stdout, /--to v3\.11\.3/);
});

test('--to bumps the tag, image, submodule and opted-in commands at the given tag', (t) => {
  const result = run(t, BUMP);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.vars, {
    ...VARS,
    nitroVersionTag: 'v3.11.4',
    latestNitroNodeImage: 'offchainlabs/nitro-node:v3.11.4-abcdef0',
    goEthereumCommit: NEW_SHA,
  });
  assert.ok(result.requests.some((url) => url.endsWith('/releases/tags/v3.11.4')));
  assert.ok(result.requests.some((url) => url.endsWith('go-ethereum?ref=v3.11.4')));
  assert.ok(result.page.includes(String(result.vars.latestNitroNodeImage)));
  assert.match(result.outputs, /updates_made=true\nupdated_version=v3\.11\.4/);
});

test('--to=<tag> is accepted as well', (t) => {
  const result = run(t, { ...BUMP, args: ['--to=v3.11.4'] });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.vars.nitroVersionTag, 'v3.11.4');
});

test('--to verifies every path pin and source link at the new tag', (t) => {
  const result = run(t, BUMP);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.requests.some((url) => url.endsWith('contents/arbos?ref=v3.11.4')));
  assert.ok(
    result.requests.some((url) => url.endsWith('contents/arbos/block_processor.go?ref=v3.11.4')),
  );
  assert.ok(result.requests.every((url) => !url.includes('?ref=v3.11.3')));
  assert.match(result.stdout, /verified 7 upstream paths at v3\.11\.4/);
});

test('--to at the pinned tag repairs the submodule without an image lookup', (t) => {
  const result = run(t, { args: ['--to', 'v3.11.3'] });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.vars, { ...VARS, goEthereumCommit: NEW_SHA });
  assert.ok(result.requests.every((url) => new URL(url).hostname !== 'hub.docker.com'));
  assert.match(result.outputs, /updates_made=true\nupdated_version=v3\.11\.3/);
});

test('--to an older published release pins it and warns', (t) => {
  const result = run(t, {
    args: ['--to', 'v3.11.2'],
    published: ['v3.11.4', 'v3.11.3', 'v3.11.2'],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.vars.nitroVersionTag, 'v3.11.2');
  assert.match(result.stdout + result.stderr, /older than the pinned/);
});

test('--to an unpublished release fails before anything is written', (t) => {
  const result = run(t, { args: ['--to', 'v9.9.9'] });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, '');
  assert.match(result.stderr, /No published Nitro release v9\.9\.9/);
});

for (const args of [['--to'], ['--to', 'nonsense']]) {
  test(`${JSON.stringify(args)} fails naming the flag before any request`, (t) => {
    const result = run(t, { args });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /--to/);
    assert.deepEqual(result.requests, []);
    assert.equal(result.raw, result.original);
    assert.equal(result.outputs, '');
  });
}

test('a pin directory missing at the new tag fails before anything is written', (t) => {
  const result = run(t, { ...BUMP, missing: ['arbos'] });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.ok(result.page.includes(VARS.latestNitroNodeImage));
  assert.equal(result.linked, LINKED_PAGE);
  assert.equal(result.outputs, '');
  assert.ok(result.requests.some((url) => url.endsWith('contents/arbos?ref=v3.11.4')));
  assert.match(result.stderr, /nitroPathToArbos = "arbos" \(content\/vars\.json\)/);
  assert.match(result.stderr, /v3\.11\.4/);
});

test('a pin directory missing at the pinned tag fails the default mode', (t) => {
  const result = run(t, { missing: ['arbos'] });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, '');
  assert.ok(result.requests.some((url) => url.endsWith('contents/arbos?ref=v3.11.3')));
  assert.ok(result.requests.every((url) => !url.includes('?ref=v3.11.4')));
  assert.match(result.stderr, /v3\.11\.3/);
});

test('a linked file missing at the new tag fails naming the page and line', (t) => {
  const result = run(t, { ...BUMP, missing: ['arbos/block_processor.go'] });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, '');
  assert.ok(
    result.requests.some((url) => url.endsWith('contents/arbos/block_processor.go?ref=v3.11.4')),
  );
  assert.match(result.stderr, /arbos\/block_processor\.go \(content\/page\.mdx:2\)/);
});

test('a rate-limited path lookup fails as an API error, not as a moved path', (t) => {
  const result = run(t, { ...BUMP, rateLimited: true });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, '');
  assert.ok(result.requests.some((url) => url.includes('?ref=v3.11.4')));
  // The message, without the stack frames: a frame names `findMissingUpstreamPaths`.
  const message = result.stderr
    .split('\n')
    .filter((line) => !/^\s+at /.test(line))
    .join('\n');
  assert.match(message, /403/);
  assert.doesNotMatch(message, /missing/i);
});

// The submodule checks run at the pinned tag in default mode even when a newer release exists.
const SUBMODULE_FAILURES: ReadonlyArray<[label: string, options: RunOptions]> = [
  ['failed submodule lookup', { status: 404 }],
  ['invalid commit', { sha: 'not-a-commit' }],
  ['regular file in place of submodule', { metadata: { type: 'file' } }],
  [
    'different repository',
    { metadata: { submodule_git_url: 'https://github.com/ethereum/go-ethereum.git' } },
  ],
];

for (const [label, options] of SUBMODULE_FAILURES) {
  test(`${label} at the pinned tag fails without changing pins or commands`, (t) => {
    const result = run(t, options);
    assert.equal(result.status, 1);
    assert.equal(result.raw, result.original);
    assert.ok(result.page.includes(VARS.latestNitroNodeImage));
    assert.equal(result.outputs, '');
    assert.ok(result.requests.some((url) => url.endsWith('go-ethereum?ref=v3.11.3')));
  });
}

test('unpublished node image fails a bump without changing pins or commands', (t) => {
  const result = run(t, { ...BUMP, images: [] });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.ok(result.page.includes(VARS.latestNitroNodeImage));
  assert.equal(result.outputs, '');
});

test('default mode reports a stale nitroContractsCommit without writing', (t) => {
  const result = run(t, { sha: OLD_SHA, contractsSha: NEW_CONTRACTS_SHA });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.raw, result.original);
  assert.ok(result.requests.some((url) => url.endsWith('contracts?ref=v3.11.3')));
  assert.match(result.outputs, /stale_pins=true/);
  assert.match(result.stdout, /nitroContractsCommit is stale for v3\.11\.3/);
  assert.match(result.stdout, /--to v3\.11\.3/);
});

test('--to writes nitroContractsCommit', (t) => {
  const result = run(t, { ...BUMP, contractsSha: NEW_CONTRACTS_SHA });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.vars.nitroContractsCommit, NEW_CONTRACTS_SHA);
  assert.ok(result.requests.some((url) => url.endsWith('contracts?ref=v3.11.4')));
  assert.match(result.outputs, /updates_made=true/);
});

test('--to checks the nitro-contracts path at the resolved contracts commit', (t) => {
  const result = run(t, { ...BUMP, contractsSha: NEW_CONTRACTS_SHA });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(
    result.requests.some((url) =>
      url.endsWith(
        `nitro-contracts/contents/src/bridge/SequencerInbox.sol?ref=${NEW_CONTRACTS_SHA}`,
      ),
    ),
  );
});

test('fails naming components/widgets/NitroTxFlow/model.ts and the step id when a model nitro path is missing', (t) => {
  const result = run(t, { ...BUMP, missing: ['execution/gethexec/sequencer.go'] });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, '');
  assert.match(
    result.stderr,
    /execution\/gethexec\/sequencer\.go \(components\/widgets\/NitroTxFlow\/model\.ts, step sequence\)/,
  );
});

test('fails when a model nitro-contracts path is missing at nitroContractsCommit', (t) => {
  const result = run(t, { ...BUMP, missing: ['src/bridge/SequencerInbox.sol'] });
  assert.equal(result.status, 1);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, '');
  assert.match(
    result.stderr,
    /src\/bridge\/SequencerInbox\.sol \(components\/widgets\/NitroTxFlow\/model\.ts, step post\)/,
  );
});
