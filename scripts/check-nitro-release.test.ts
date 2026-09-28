import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./check-nitro-release.ts', import.meta.url));
const OLD_SHA = '1'.repeat(40);
const NEW_SHA = '2'.repeat(40);
const VARS: Record<string, string> = {
  nitroVersionTag: 'v3.11.3',
  latestNitroNodeImage: 'offchainlabs/nitro-node:v3.11.3-beb2108',
  goEthereumCommit: OLD_SHA,
  unrelated: 'preserve me',
};

/** What a test can vary about the mocked GitHub and Docker Hub responses. */
interface RunOptions {
  latest?: string;
  sha?: string;
  status?: number;
  metadata?: Record<string, unknown>;
  vars?: Record<string, string>;
  images?: Array<{ name: string }>;
}

// Exercise the actual CLI in an isolated content tree, with every network request mocked.
function run(
  t: TestContext,
  {
    latest = 'v3.11.4',
    sha = NEW_SHA,
    status = 200,
    metadata = {},
    vars = VARS,
    images,
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
  const requestsPath = path.join(root, 'requests.jsonl');
  const outputPath = path.join(root, 'outputs');
  const responses = {
    latest,
    submodule: {
      type: 'submodule',
      submodule_git_url: 'https://github.com/OffchainLabs/go-ethereum.git',
      sha,
      ...metadata,
    },
    status,
    images: images ?? [{ name: `${latest}-abcdef0` }],
  };
  const mock = `
    import fs from 'node:fs';
    const data = ${JSON.stringify(responses)};
    globalThis.fetch = async (url) => {
      fs.appendFileSync(${JSON.stringify(requestsPath)}, JSON.stringify(url) + '\\n');
      if (url.endsWith('/releases/latest')) return Response.json({ tag_name: data.latest });
      if (url.includes('/contents/go-ethereum?ref=')) {
        return Response.json(data.submodule, { status: data.status });
      }
      if (url.startsWith('https://hub.docker.com/')) return Response.json({ results: data.images });
      throw new Error('Unexpected request: ' + url);
    };
  `;
  const result = spawnSync(
    process.execPath,
    ['--import', `data:text/javascript,${encodeURIComponent(mock)}`, SCRIPT],
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
    requests: fs
      .readFileSync(requestsPath, 'utf8')
      .trim()
      .split('\n')
      .map((line): string => String(JSON.parse(line))),
    outputs: fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '',
  };
}

/** The rewritten vars.json, narrowed to the flat string map every fixture writes. */
function parseVars(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text);
  assert.ok(typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed));
  return Object.fromEntries(Object.entries(parsed));
}

test('a release bump updates the submodule, image and opted-in commands together', (t) => {
  const result = run(t);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.vars, {
    ...VARS,
    nitroVersionTag: 'v3.11.4',
    latestNitroNodeImage: 'offchainlabs/nitro-node:v3.11.4-abcdef0',
    goEthereumCommit: NEW_SHA,
  });
  assert.ok(result.requests.some((url) => url.endsWith('go-ethereum?ref=v3.11.4')));
  assert.ok(result.page.includes(String(result.vars.latestNitroNodeImage)));
  assert.match(result.outputs, /updates_made=true\nupdated_version=v3.11.4/);
});

for (const latest of ['v3.11.3', 'v3.11.2']) {
  test(`repairs a stale submodule without downgrading Nitro when latest is ${latest}`, (t) => {
    const result = run(t, { latest });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(result.vars, { ...VARS, goEthereumCommit: NEW_SHA });
    assert.ok(result.requests.some((url) => url.endsWith('go-ethereum?ref=v3.11.3')));
    assert.ok(result.requests.every((url) => !url.includes('hub.docker.com')));
    assert.ok(result.page.includes(VARS.latestNitroNodeImage));
    assert.match(result.outputs, /updates_made=true\nupdated_version=v3.11.3/);
  });
}

test('repairs a missing submodule pin without waiting for a Nitro release', (t) => {
  const { goEthereumCommit, ...vars } = VARS;
  const result = run(t, { latest: VARS.nitroVersionTag, vars });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.vars.goEthereumCommit, NEW_SHA);
});

test('matching pins leave the vars file byte-for-byte unchanged', (t) => {
  const result = run(t, { latest: VARS.nitroVersionTag, sha: OLD_SHA });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.raw, result.original);
  assert.equal(result.outputs, 'updates_made=false\n');
});

const FAILURES: ReadonlyArray<[label: string, options: RunOptions]> = [
  ['failed submodule lookup', { status: 404 }],
  ['invalid commit', { sha: 'not-a-commit' }],
  ['regular file in place of submodule', { metadata: { type: 'file' } }],
  [
    'different repository',
    { metadata: { submodule_git_url: 'https://github.com/ethereum/go-ethereum.git' } },
  ],
  ['unpublished node image', { images: [] }],
];

for (const [label, options] of FAILURES) {
  test(`${label} fails without changing pins or commands`, (t) => {
    const result = run(t, options);
    assert.equal(result.status, 1);
    assert.equal(result.raw, result.original);
    assert.ok(result.page.includes(VARS.latestNitroNodeImage));
    assert.equal(result.outputs, '');
  });
}
