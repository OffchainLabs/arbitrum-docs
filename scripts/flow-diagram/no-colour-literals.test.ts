import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const WIDGET_DIR = path.join(
  import.meta.dirname,
  '..',
  '..',
  'components',
  'widgets',
  'FlowDiagram',
);
const COLOUR = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;

test('the FlowDiagram widget code holds no colour literal; diagrams/theme.yaml does', () => {
  const files = readdirSync(WIDGET_DIR).filter((name) => name !== 'flows.generated.ts');
  assert.ok(files.length > 0);
  const found: string[] = [];
  for (const name of files) {
    readFileSync(path.join(WIDGET_DIR, name), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (COLOUR.test(line)) found.push(`${name}:${i + 1}: ${line.trim()}`);
      });
  }
  assert.deepEqual(found, []);
});
