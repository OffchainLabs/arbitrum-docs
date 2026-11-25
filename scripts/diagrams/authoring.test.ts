import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const AUTHORING = 'diagrams/AUTHORING.md';
const SECTIONS = [
  'Start',
  'Sort the input',
  'A flow diagram',
  'Offer an interactive diagram',
  'Concept art',
  'Finish',
];

function read(file: string): string {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

function slug(heading: string): string {
  return heading
    .toLowerCase()
    .replaceAll('`', '')
    .replaceAll(/[^a-z0-9 -]/g, '')
    .replaceAll(' ', '-');
}

function section(text: string, title: string): string {
  const start = text.indexOf(`\n## ${title}\n`);
  assert.ok(start >= 0, `no "## ${title}" section`);
  const end = text.indexOf('\n## ', start + 1);
  return text.slice(start, end < 0 ? undefined : end);
}

test('AUTHORING.md exists and has the six sections in order', () => {
  const headings = [...read(AUTHORING).matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, SECTIONS);
});

test('every pnpm command it names is a package.json script', () => {
  const scripts = JSON.parse(read('package.json')).scripts as Record<string, string>;
  const names = [...read(AUTHORING).matchAll(/`pnpm ([a-z:-]+)/g)].map((match) => match[1]!);
  assert.ok(names.length > 0, 'names no pnpm command');
  const builtins = new Set(['exec']);
  for (const name of names) {
    assert.ok(builtins.has(name) || scripts[name], `pnpm ${name} is not a script`);
  }
});

test('every relative link resolves', () => {
  for (const [, target] of read(AUTHORING).matchAll(/\]\(([^)]+)\)/g)) {
    if (target!.startsWith('http') || target!.startsWith('#')) continue;
    const [file, fragment] = target!.split('#');
    const resolved = path.join(ROOT, 'diagrams', file!);
    assert.ok(existsSync(resolved), `${target} does not exist`);
    if (fragment === undefined) continue;
    const slugs = [...readFileSync(resolved, 'utf8').matchAll(/^#+ (.+)$/gm)].map((m) =>
      slug(m[1]!),
    );
    assert.ok(slugs.includes(fragment), `${target}: no heading #${fragment}`);
  }
});

test('it covers screenshots, the static grid and safe raster removal', () => {
  const text = read(AUTHORING);
  assert.match(text, /screenshot/);
  assert.match(text, /svg:/);
  assert.match(text, /trash/);
  assert.doesNotMatch(text, /`rm |rm -/);
});

test('each entry point links diagrams/AUTHORING.md', () => {
  for (const file of ['AGENTS.md', 'CLAUDE.md', 'INTERNALS.md', 'CONTRIBUTE.md']) {
    assert.ok(read(file).includes(`](${AUTHORING})`), `${file} does not link ${AUTHORING}`);
  }
});

test('the converter agent follows AUTHORING.md and leaves generation to the coordinator', () => {
  const agent = read('.claude/agents/diagram-converter.md');
  assert.ok(agent.includes(AUTHORING), `the agent does not name ${AUTHORING}`);
  assert.match(agent, /not run\s+`pnpm diagrams:generate`/);
  assert.match(agent, /photo\/screenshot/);
});

test('the brand skill points to AUTHORING.md', () => {
  const skill = read('.claude/skills/arbitrum-brand-svg-diagrams/SKILL.md');
  assert.ok(skill.includes(AUTHORING), `the skill does not name ${AUTHORING}`);
});

test('the Codex agent and skill copies point to AUTHORING.md too', () => {
  const agent = read('.codex/agents/diagram-converter.toml');
  assert.ok(agent.includes(AUTHORING), `the Codex agent does not name ${AUTHORING}`);
  assert.match(agent, /not run\s+`pnpm diagrams:generate`/);
  const skill = read('.agents/skills/arbitrum-brand-svg-diagrams/SKILL.md');
  assert.ok(skill.includes(AUTHORING), `the Codex skill does not name ${AUTHORING}`);
});

test('the coordinator of parallel converters does the visual check and merges parts.yaml', () => {
  for (const file of [
    '.claude/agents/diagram-converter.md',
    '.codex/agents/diagram-converter.toml',
  ]) {
    const coordinator = read(file).slice(read(file).indexOf('coordinator'));
    assert.match(coordinator, /step 8/, `${file}: the coordinator does not do step 8`);
    assert.match(coordinator, /parts\.yaml/, `${file}: the coordinator does not merge parts.yaml`);
  }
});

test('it counts the key cell and warns the widget accepts less than the static SVG', () => {
  const text = read(AUTHORING);
  assert.match(text, /top-right cell holds the key/);
  const offer = section(text, 'Offer an interactive diagram');
  assert.match(offer, /solid, one-way/);
  assert.match(offer, /separate flow/);
});

test('it offers the interactive version and asks before building it', () => {
  const offer = section(read(AUTHORING), 'Offer an interactive diagram');
  assert.match(offer, /\bask/i);
  assert.match(offer, /<FlowDiagram flow=/);
});
