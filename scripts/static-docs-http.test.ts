/** Run against `next start` after a production build; CI's Build job supplies the URL. */
import assert from 'node:assert/strict';
import test from 'node:test';

import { appName, gitConfig } from '../lib/shared.ts';

const baseUrl = process.env.STATIC_DOCS_TEST_URL;
const livePath = '/docs/run-a-node/start-here';
const liveMirror = `/llms.mdx${livePath}/content.md`;
const documentOnly = (html: string): string =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const get = (path: string, options?: RequestInit): Promise<Response> =>
  fetch(new URL(path, baseUrl), options);

const head = async (path: string): Promise<string> => {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  return await response.text();
};
const tag = (html: string, pattern: RegExp): string | undefined => html.match(pattern)?.[1];
const title = (html: string): string | undefined => tag(html, /<title>([^<]*)<\/title>/);
const meta = (html: string, name: string): string | undefined =>
  tag(html, new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`));
// The instant behind the page body's "Last updated on …" line, which `generateMetadata` reads from
// the same `lastModified` value as `article:modified_time`. Scripts are stripped first: the flight
// payload repeats this markup, so matching the raw document would find a date on a page that
// rendered no line at all.
const bodyLastModified = (html: string): string | undefined =>
  tag(documentOnly(html), /Last updated on[\s\S]{0,40}?<time[^>]*datetime="([^"]*)"/i);
/**
 * `article:modified_time` is present if and only if the body rendered its "Last updated on" line,
 * and carries the same instant. A shallow checkout, such as CI's, renders neither, so asserting the
 * equivalence keeps the check meaningful there.
 */
const assertModifiedTimeMatchesBody = (html: string, label: string): void => {
  const modified = meta(html, 'article:modified_time');
  const rendered = bodyLastModified(html);
  assert.equal(
    modified !== undefined,
    rendered !== undefined,
    `${label}: article:modified_time is ${modified}, the body's "Last updated on" time is ${rendered}`,
  );
  if (modified !== undefined) {
    assert.ok(!Number.isNaN(Date.parse(modified)), `${label}: unparseable instant ${modified}`);
    assert.equal(modified, rendered, label);
  }
};

test('built static docs routing', { skip: !baseUrl }, async (t) => {
  await t.test('a docs page is prerendered HTML, whatever the Accept header', async () => {
    for (const accept of ['text/html', 'text/markdown']) {
      const response = await get(livePath, { headers: { accept } });
      assert.equal(response.status, 200, accept);
      assert.match(response.headers.get('cache-control') ?? '', /s-maxage=/, accept);
      assert.match(response.headers.get('content-type') ?? '', /text\/html/, accept);
      assert.match(documentOnly(await response.text()), /Copy Markdown/, accept);
    }
  });

  await t.test('both markdown URLs serve the same page as markdown', async () => {
    const bodies: string[] = [];
    for (const path of [`${livePath}.md`, liveMirror]) {
      const response = await get(path);
      assert.equal(response.status, 200, path);
      assert.match(response.headers.get('content-type') ?? '', /text\/markdown/, path);
      const body = await response.text();
      assert.match(body.split('\n')[0], new RegExp(`\\(${livePath}\\)$`), path);
      bodies.push(body);
    }
    assert.equal(bodies[0], bodies[1]);
  });

  await t.test('the docs index has a direct markdown URL', async () => {
    const response = await get('/docs.md');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /text\/markdown/);
    await response.text();
  });

  await t.test('a query string does not change the page served', async () => {
    const response = await get(`${livePath}?v=v1`, { redirect: 'manual' });
    assert.equal(response.status, 200);
    await response.text();
  });

  await t.test('unknown docs slugs serve the visible 404 page', async () => {
    // The copy is checked with scripts stripped, because a 200 page carries it in its flight payload.
    for (const path of ['/docs/does-not-exist', '/docs/does/not/exist/deep', `${livePath}/v1`]) {
      const response = await get(path);
      assert.equal(response.status, 404, path);
      const doc = documentOnly(await response.text());
      assert.match(doc, /Start somewhere else/, path);
      assert.doesNotMatch(doc, /__next_error__/, path);
    }
  });

  await t.test('unknown markdown URLs 404', async () => {
    for (const path of [
      '/docs/does-not-exist.md',
      `${livePath}/v1.md`,
      `/llms.mdx${livePath}/v1/content.md`,
      `/llms.mdx${livePath}/not-content.md`,
      '/llms.mdx/docs/constructor/content.md',
      '/llms.mdx/docs/__proto__/content.md',
    ]) {
      const response = await get(path);
      assert.equal(response.status, 404, path);
      await response.text();
    }
  });

  await t.test('the docs 404 is the same response as the root 404', async () => {
    const [root, docs] = await Promise.all([get('/does-not-exist'), get('/docs/does-not-exist')]);
    assert.equal(root.status, 404);
    assert.equal(docs.status, 404);
    assert.equal(await docs.text(), await root.text());
    for (const response of [root, docs]) {
      assert.match(response.headers.get('cache-control') ?? '', /no-store/);
    }
  });

  await t.test('discovery files are served', async () => {
    for (const path of ['/sitemap.xml', '/robots.txt', '/llms.txt', '/llms-full.txt']) {
      const response = await get(path);
      assert.equal(response.status, 200, path);
      await response.text();
    }
  });
});

test('markdown mirrors carry no MDX comments', { skip: !baseUrl }, async (t) => {
  const noComments = (body: string, path: string): void => {
    assert.ok(body.length > 0, path);
    assert.equal(body.includes('{/*'), false, `${path} still serves an MDX comment`);
  };

  await t.test('a page mirror is clean and still carries its prose', async () => {
    for (const path of ['/docs/contribute.md', '/llms.mdx/docs/contribute/content.md']) {
      const response = await get(path);
      assert.equal(response.status, 200, path);
      const body = await response.text();
      noComments(body, path);
      assert.match(body, /Arbitrum documentation/, path);
    }
  });

  await t.test('llms-full.txt is clean site-wide', async () => {
    const response = await get('/llms-full.txt');
    assert.equal(response.status, 200);
    const body = await response.text();
    noComments(body, '/llms-full.txt');
    assert.ok(body.length > 100_000);
  });
});

test('well-known MCP discovery card', { skip: !baseUrl }, async (t) => {
  const cardPath = '/.well-known/mcp/server-card.json';

  await t.test('serves the card as JSON', async () => {
    const response = await get(cardPath);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /application\/json/);
    const card: { transport: { type: string; endpoint: string } } = JSON.parse(
      await response.text(),
    );
    assert.equal(card.transport.type, 'streamable-http');
    assert.equal(card.transport.endpoint, 'https://mcp.inkeep.com/offchainlabs/mcp');
  });

  await t.test('a well-known path with no file behind it is a 404', async () => {
    const response = await get('/.well-known/nope.json');
    assert.equal(response.status, 404);
    await response.text();
  });

  await t.test('robots.txt does not disallow the well-known tree', async () => {
    const response = await get('/robots.txt');
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /Disallow:\s*\/\.well-known/i);
  });
});

test('home page metadata', { skip: !baseUrl }, async (t) => {
  await t.test('the root carries a title, description, canonical and social tags', async () => {
    const html = await head('/');
    assert.equal(title(html), 'Arbitrum documentation');
    assert.match(meta(html, 'description') ?? '', /^Arbitrum is the finance-native platform/);
    assert.match(tag(html, /<link rel="canonical" href="([^"]*)"/) ?? '', /^https?:\/\/[^/]+\/?$/);
    assert.equal(meta(html, 'og:type'), 'website');
    assert.equal(meta(html, 'og:title'), 'Arbitrum documentation');
    assert.equal(meta(html, 'og:description'), meta(html, 'description'));
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
    assert.equal(meta(html, 'twitter:site'), '@arbitrum');
    assert.equal(meta(html, 'twitter:title'), 'Arbitrum documentation');
  });

  await t.test('the social card the root names is a real 1200x630 PNG', async () => {
    // Next serves `app/(home)/opengraph-image.tsx` from `/opengraph-image-<hash>`, so the URL is
    // read out of the document.
    const html = await head('/');
    const image = meta(html, 'og:image');
    assert.ok(image, 'no og:image on /');
    assert.equal(meta(html, 'twitter:image'), image);
    assert.equal(meta(html, 'og:image:width'), '1200');
    assert.equal(meta(html, 'og:image:height'), '630');

    const url = new URL(image);
    const response = await get(`${url.pathname}${url.search}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /image\/png/);
    assert.ok((await response.arrayBuffer()).byteLength > 1024);
  });

  await t.test('the root and the docs landing page do not share a title', async () => {
    const [root, docs] = await Promise.all([head('/'), head('/docs')]);
    assert.notEqual(title(root), title(docs));
    assert.notEqual(meta(root, 'description'), meta(docs, 'description'));
  });
});

test('docs page open graph tags', { skip: !baseUrl }, async (t) => {
  await t.test(
    'a live page carries og:site_name, og:type, og:url and a modified time',
    async () => {
      const html = await head(livePath);
      assert.equal(meta(html, 'og:site_name'), appName);
      assert.equal(meta(html, 'og:type'), 'article');
      assert.equal(meta(html, 'og:url'), tag(html, /<link rel="canonical" href="([^"]*)"/));
      assertModifiedTimeMatchesBody(html, livePath);
      assert.equal(meta(html, 'og:title'), title(html));
      assert.ok(meta(html, 'og:image'), 'no og:image on a docs page');
    },
  );

  await t.test('the docs landing page is typed like every other page under /docs', async () => {
    const docs = await head('/docs');
    assert.equal(meta(docs, 'og:type'), 'article');
    assert.equal(meta(docs, 'og:site_name'), appName);
  });
});

test('the contribute guide links back into this repository', { skip: !baseUrl }, async (t) => {
  // Proves the `{var:docsRepositoryUrl}` placeholders expanded in the rendered page;
  // `scripts/lib/contribute-repo-links.test.ts` checks the source.
  // Placeholder profile in the community-contribution banner example.
  const allowed = new Set(['https://github.com/handle']);
  const html = documentOnly(await head('/docs/contribute'));
  const hrefs = [...html.matchAll(/href="(https:\/\/github\.com\/[^"]*)"/g)].map((m) => m[1]);

  await t.test('every GitHub link belongs to the repository gitConfig names', () => {
    const own = hrefs.filter((url) => url === gitConfig.url || url.startsWith(`${gitConfig.url}/`));
    assert.ok(own.length > 0, 'the page rendered no link back into this repository');
    assert.deepEqual(
      hrefs.filter((url) => !own.includes(url) && !allowed.has(url)),
      [],
    );
  });

  await t.test('the "know more tools?" box offers this repository\'s issue tracker', async () => {
    const page = documentOnly(
      await head('/docs/arbitrum-essentials/reference/web3-libraries-tools'),
    );
    assert.ok(
      page.includes(`href="${gitConfig.url}/issues/new"`),
      "the know-more box does not link to this repository's issue tracker",
    );
    assert.ok(!page.includes('{var:'), 'a {var:…} placeholder reached the reader unexpanded');
  });

  await t.test('no placeholder survived into the rendered page', () => {
    assert.ok(!html.includes('{var:'), 'a {var:…} placeholder reached the reader unexpanded');
  });
});
