/** Exercise the runner's checkout boundary through a local Git archive, without network access. */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceRoot } from './data/stylus-examples.data.ts';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const relativePage = 'basic_examples/hello_world/page.mdx';
const page =
  'export const metadata = { title: "Fixture", description: "Fixture page" };\n\n# Hello\n\nFixture body.\n';

for (const linkedPath of [null, sourceRoot, path.dirname(sourceRoot)]) {
  it(`Stylus runner ${linkedPath ? `rejects a symlink at ${linkedPath}` : 'reads a regular checkout'}`, (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylus-source-boundary-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const repo = path.join(dir, 'upstream');
    const runner = path.join(dir, 'runner');
    fs.mkdirSync(repo);
    const appDir = path.join(repo, sourceRoot);
    if (linkedPath) {
      const outside = path.join(dir, 'outside');
      const remainder = path.relative(linkedPath, sourceRoot);
      fs.mkdirSync(path.join(outside, remainder, path.dirname(relativePage)), { recursive: true });
      fs.writeFileSync(path.join(outside, remainder, relativePage), page);
      fs.mkdirSync(path.dirname(path.join(repo, linkedPath)), { recursive: true });
      fs.symlinkSync(outside, path.join(repo, linkedPath));
    } else {
      fs.mkdirSync(path.join(appDir, path.dirname(relativePage)), { recursive: true });
      fs.writeFileSync(path.join(appDir, relativePage), page);
    }

    const git = (args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf-8' });
    git(['init', '--quiet']);
    git(['add', '.']);
    git([
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.com',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    ]);
    const repoRef = git(['rev-parse', 'HEAD']).trim();

    fs.mkdirSync(path.join(runner, 'scripts/data'), { recursive: true });
    fs.writeFileSync(path.join(runner, 'package.json'), '{"type":"module"}');
    fs.copyFileSync(
      path.join(scriptDir, 'generate-stylus-examples.ts'),
      path.join(runner, 'scripts/generate-stylus-examples.ts'),
    );
    fs.symlinkSync(path.join(scriptDir, 'lib'), path.join(runner, 'scripts/lib'));
    fs.symlinkSync(path.join(scriptDir, '../node_modules'), path.join(runner, 'node_modules'));
    const outputDir = path.join(runner, 'output');
    const inputs = {
      repoRef,
      sourceRoot,
      repoUrl: 'https://example.com/unused.git',
      outputDir,
      outputUrl: '/stylus',
      frontmatterDefaults: { content_type: 'concept', author: 'fixture', sme: 'fixture' },
      notForProductionInclude:
        '<include cwd>content/partials/_not-for-production-banner-partial.mdx</include>',
      sections: [{ dir: 'basic_examples', title: 'Basic examples', pages: ['hello_world'] }],
    };
    fs.writeFileSync(
      path.join(runner, 'scripts/data/stylus-examples.data.ts'),
      Object.entries(inputs)
        .map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`)
        .join('\n'),
    );
    const result = spawnSync(
      process.execPath,
      ['scripts/generate-stylus-examples.ts', '--source-path', repo],
      { cwd: runner, encoding: 'utf-8', timeout: 15_000 },
    );
    assert.ifError(result.error);
    if (linkedPath) {
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /is a symlink, or sits under one/);
      assert.equal(fs.existsSync(outputDir), false);
    } else {
      assert.equal(result.status, 0, result.stderr);
      assert.match(
        fs.readFileSync(path.join(outputDir, 'basic_examples/hello_world.mdx'), 'utf-8'),
        /Fixture body\./,
      );
    }
  });
}
