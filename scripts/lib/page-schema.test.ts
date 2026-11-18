/**
 * The page frontmatter contract in `lib/page-schema.ts`. ESLint rule `docs/frontmatter-schema`
 * applies it to every page; `eslint/rules.test.ts` covers how a broken page is reported.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { arbitrumPageSchema } from '../../lib/page-schema.ts';

test('the schema preserves third-party ownership independently of the SME', () => {
  const page = { title: 'Partner guide', description: 'A page.', sme: 'reviewer' };
  assert.equal(arbitrumPageSchema.parse(page).third_party_content_owner, undefined);
  const parsed = arbitrumPageSchema.parse({ ...page, third_party_content_owner: 'partner' });
  assert.equal(parsed.third_party_content_owner, 'partner');
  assert.equal(parsed.sme, 'reviewer');
  assert.equal(
    arbitrumPageSchema.safeParse({ ...page, third_party_content_owner: 123 }).success,
    false,
  );
});

test('audience and reader goals survive parsing and remain optional', () => {
  const required = { title: 'Rotate keys', description: 'Keep node keys secure.' };
  const metadata = {
    target_audience: 'Chain operators',
    user_story: 'As a chain operator, I want to rotate node keys so I can keep my chain secure.',
  };
  assert.deepEqual(arbitrumPageSchema.parse({ ...required, ...metadata }), {
    ...required,
    ...metadata,
  });
  assert.equal(arbitrumPageSchema.safeParse(required).success, true);
});

test('user_story is optional, survives parsing and must be a string when present', () => {
  const metadata = { title: 'Good', description: 'A page.' };
  assert.ok(arbitrumPageSchema.safeParse(metadata).success);
  const user_story = 'As a developer, I want to deploy my first Stylus contract';
  assert.equal(arbitrumPageSchema.parse({ ...metadata, user_story }).user_story, user_story);
  assert.equal(arbitrumPageSchema.safeParse({ ...metadata, user_story: 123 }).success, false);
});
