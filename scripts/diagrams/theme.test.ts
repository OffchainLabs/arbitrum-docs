import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { loadTheme } from './load.ts';

const THEME = `gradient: 'linear-gradient(180deg, #000000 0%, #ffffff 100%)'
connector: '#111111'
active: '#222222'
activeGlow: '0 0 0 5px #333333'
startGlow: '0 0 0 3px #444444'
focus: '#555555'
chip: '#666666'
ink: '#777777'
badge: '#888888'
badgeText: '#999999'
font: sans-serif
dimmed: 0.5
`;

const made: string[] = [];
after(() => Promise.all(made.map((dir) => rm(dir, { recursive: true, force: true }))));

async function themeDir(text: string): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'theme-'));
  made.push(root);
  const dir = path.join(root, 'diagrams');
  await mkdir(dir);
  await writeFile(path.join(dir, 'theme.yaml'), text);
  return dir;
}

test('loads every theme key', async () => {
  const theme = await loadTheme(await themeDir(THEME));
  assert.equal(theme.ink, '#777777');
  assert.equal(theme.font, 'sans-serif');
  assert.equal(theme.dimmed, 0.5);
  assert.equal(Object.keys(theme).length, 12);
});

test('rejects a missing theme key and names the file and the key', async () =>
  assert.rejects(loadTheme(await themeDir(THEME.replace("ink: '#777777'\n", ''))), {
    message: /diagrams\/theme\.yaml:\d+: ink: /,
  }));

test('rejects an unknown theme key and names the file and the key', async () =>
  assert.rejects(loadTheme(await themeDir(`${THEME}glow: '#000000'\n`)), {
    message: /diagrams\/theme\.yaml:\d+: .*"glow"/,
  }));

test('rejects an empty theme colour', async () =>
  assert.rejects(loadTheme(await themeDir(THEME.replace("'#111111'", "''"))), {
    message: /diagrams\/theme\.yaml:2: connector: must not be empty/,
  }));
