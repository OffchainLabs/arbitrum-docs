import { execFileSync } from 'node:child_process';

// Vercel checks out a shallow copy by default. Fumadocs needs the complete history to resolve
// each document's last change, and its postinstall generation runs before the build command.
if (process.env.VERCEL_ENV) {
  const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
    encoding: 'utf8',
  }).trim();

  if (shallow === 'true') {
    execFileSync(
      'git',
      [
        'fetch',
        '--no-tags',
        '--unshallow',
        process.env.DOCS_HISTORY_REMOTE ?? 'https://github.com/OffchainLabs/Fumadocs-test.git',
      ],
      { stdio: 'inherit' },
    );
  }

  if (
    execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() !==
    'false'
  ) {
    throw new Error('Full Git history is required to show accurate docs last updated dates.');
  }
}
