/** Run against `next start` after a production build; CI's Build job supplies the URL. */
import assert from 'node:assert/strict';
import test from 'node:test';

// Imported as `.ts` rather than restated as a literal, the way `scripts/lib/shared.test.ts` does
// and for the reason it gives: Node 22 strips types natively and `lib/shared.ts` imports only
// `./site-url.ts`, which Node strips the same way, so this asserts against the exact constant the
// page renders instead of a copy that can drift from it.
import { appName, gitConfig } from '../lib/shared.ts';

const baseUrl = process.env.STATIC_DOCS_TEST_URL;
const livePath = '/docs/run-a-node/start-here';
const archivePath = `${livePath}/v1`;
const liveMirror = `/llms.mdx${livePath}/content.md`;
const archiveMirror = `/llms.mdx${archivePath}/content.md`;
const archivedText = 'This archived guide targets the ArbOS 20 release series.';
const documentOnly = (html: string): string =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const get = (path: string, options?: RequestInit): Promise<Response> =>
  fetch(new URL(path, baseUrl), options);

// Shared by the metadata tests below (FS-2713's home page test and FS-2724's docs page test), so
// the two cannot check the tags in two different ways.
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
 * and carries the same instant (FS-2724).
 *
 * Asserting the equivalence rather than the tag is what makes this mean something everywhere. Both
 * values come from one `lastModified`, which is `undefined` whenever the checkout has no full git
 * history (`hasFullGitHistory` in source.config.ts). CI's `actions/checkout` sets no `fetch-depth`,
 * so it runs at the default depth of 1, so the one place this suite runs automatically is the one
 * place the tag is guaranteed absent. A bare `if (tag) assert(...)` would therefore never execute
 * in CI and would pass silently on a regression that dropped the tag altogether.
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
  await t.test('HTML and negotiated markdown both vary on Accept', async () => {
    for (const accept of ['text/html', 'text/markdown']) {
      const response = await get(livePath, { headers: { accept } });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('vary') ?? '', /(?:^|,\s*)Accept(?:,|$)/i, accept);
      assert.match(response.headers.get('cache-control') ?? '', /s-maxage=/);
      assert.match(response.headers.get('content-type') ?? '', new RegExp(accept));
      await response.text();
    }
  });

  await t.test('weighted Accept headers select the preferred representation', async () => {
    for (const [accept, contentType] of [
      ['text/html;q=1, text/markdown;q=0', /text\/html/],
      ['text/html, text/markdown;q=0.1', /text\/html/],
      ['text/markdown;q=1, text/html;q=0.1', /text\/markdown/],
    ] as const) {
      const response = await get(livePath, { headers: { accept } });
      assert.equal(response.status, 200, accept);
      assert.match(response.headers.get('content-type') ?? '', contentType, accept);
      await response.text();
    }
  });

  await t.test('the docs index has a direct markdown URL', async () => {
    const response = await get('/docs.md');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /text\/markdown/);
    await response.text();
  });

  await t.test('client-supplied routing headers cannot override Accept', async () => {
    for (const [accept, marker] of [
      ['text/html', '1'],
      ['text/markdown', '0'],
    ]) {
      const response = await get(livePath, {
        headers: { accept, 'x-docs-markdown-preferred': marker },
      });
      assert.equal(response.status, 200, accept);
      assert.match(response.headers.get('content-type') ?? '', new RegExp(accept), accept);
      assert.match(response.headers.get('vary') ?? '', /(?:^|,\s*)Accept(?:,|$)/i, accept);
      await response.text();
    }
  });

  await t.test('archives render their own body and their own markdown controls', async () => {
    const live = await get(livePath);
    assert.equal(live.status, 200);
    const liveHtml = await live.text();
    assert.ok(!documentOnly(liveHtml).includes(archivedText));
    assert.match(documentOnly(liveHtml), /Copy Markdown/);
    const archive = await get(archivePath);
    assert.equal(archive.status, 200);
    assert.match(archive.headers.get('cache-control') ?? '', /s-maxage=/);
    const html = await archive.text();
    const doc = documentOnly(html);
    assert.ok(doc.includes(archivedText));
    // The copy and view-as-markdown controls exist on an archive too (FS-2711) and must address
    // the archive's own mirror. Offering the live page's text under an archive URL is the mistake
    // `?v=` made before FS-2698.
    assert.match(doc, /Copy Markdown/);
    assert.ok(html.includes(archiveMirror));
    assert.ok(!html.includes(liveMirror));
    assert.ok(html.includes('content/_versions/v1/run-a-node/start-here.mdx'));
    assert.match(doc, /<meta name="robots" content="noindex, follow"/);
    assert.match(doc, /<link rel="canonical" href="[^"]+\/docs\/run-a-node\/start-here"/);
  });

  await t.test('legacy versions redirect and retain unrelated query parameters', async () => {
    for (const [source, destination] of [
      [`${livePath}?v=v1`, archivePath],
      [`${livePath}?v=latest`, livePath],
      [`${livePath}?v=unknown`, livePath],
      // The `.md` form used to fall through and answer with Latest's text. It carries the suffix
      // across now that an archive has a markdown mirror of its own (FS-2711).
      [`${livePath}.md?v=v1`, `${archivePath}.md`],
      [`${livePath}.md?v=unknown`, `${livePath}.md`],
    ]) {
      const [path, query] = source.split('?');
      const response = await get(`${path}?${query}&ref=test`, { redirect: 'manual' });
      assert.equal(response.status, 308, source);
      const location = response.headers.get('location');
      assert.ok(location, `${source}: 308 with no Location header`);
      const target = new URL(location, baseUrl);
      assert.equal(target.pathname, destination, source);
      assert.equal(target.search, '?ref=test', source);
      await response.text();
    }
  });

  await t.test('unknown docs and prototype-named slugs serve visible 404s', async () => {
    // FS-2688. `dynamicParams = false` is what makes these land on the prerendered `/_not-found`
    // entry instead of the empty `__next_error__` shell a mid-render `notFound()` produces. The
    // copy has to be in the document with scripts stripped: a *200* page carries it too, inside the
    // router's prefetched flight payload.
    for (const path of [
      '/docs/does-not-exist',
      '/docs/does/not/exist/deep',
      `${livePath}/v99`,
      '/docs/constructor?v=v1',
      '/docs/__proto__?v=v1',
    ]) {
      const response = await get(path);
      assert.equal(response.status, 404, path);
      const doc = documentOnly(await response.text());
      assert.match(doc, /Start somewhere else/);
      assert.doesNotMatch(doc, /__next_error__/);
    }
  });

  await t.test('every markdown shape of an archive serves the archive, not Latest', async () => {
    const live = await get(`${livePath}.md`);
    assert.equal(live.status, 200);
    const liveText = await live.text();
    assert.ok(!liveText.includes(archivedText));

    // The suffix, the mirror, and content negotiation: the same three shapes a live page has.
    const requests: [path: string, headers: Record<string, string> | undefined][] = [
      [`${archivePath}.md`, undefined],
      [archiveMirror, undefined],
      [archivePath, { accept: 'text/markdown' }],
      // A legacy `?v=` link keeps working, and now reaches the archive's text rather than Latest's.
      [`${livePath}.md?v=v1`, undefined],
      [`${livePath}?v=v1`, { accept: 'text/markdown' }],
    ];
    for (const [path, headers] of requests) {
      const response = await get(path, headers ? { headers } : undefined);
      assert.equal(response.status, 200, path);
      assert.match(response.headers.get('content-type') ?? '', /text\/markdown/, path);
      const text = await response.text();
      assert.ok(text.includes(archivedText), path);
      assert.notEqual(text, liveText, path);
      assert.match(text.split('\n')[0], new RegExp(`\\(${archivePath}\\)$`), path);
    }

    // Archives are noindex with a canonical to the live page. A markdown body can carry neither
    // tag, so the mirror states it in the only place it can. Live markdown stays header-free.
    const mirror = await get(archiveMirror);
    assert.match(mirror.headers.get('x-robots-tag') ?? '', /noindex/);
    await mirror.text();
    const liveMirrorResponse = await get(liveMirror);
    assert.equal(liveMirrorResponse.headers.get('x-robots-tag'), null);
    await liveMirrorResponse.text();
  });

  await t.test('a version id that names no archive 404s rather than serving Latest', async () => {
    for (const path of [
      `${livePath}/v99.md`,
      `/llms.mdx${livePath}/v99/content.md`,
      // A page with no archives at all; `/docs/chain-info` is not in VERSIONED.
      '/docs/chain-info/v1.md',
      '/llms.mdx/docs/chain-info/v1/content.md',
    ]) {
      const response = await get(path);
      assert.equal(response.status, 404, path);
      await response.text();
    }
    const negotiated = await get(`${livePath}/v99`, { headers: { accept: 'text/markdown' } });
    assert.equal(negotiated.status, 404);
    await negotiated.text();
  });

  await t.test('only content.md is served as a direct markdown mirror', async () => {
    // The mirror handler permits dynamic params so proxy rewrites work in Next 16. It must still
    // reject a different trailing filename rather than serving the preceding page's markdown.
    const response = await get(`/llms.mdx${livePath}/not-content.md`);
    assert.equal(response.status, 404);
    await response.text();
  });

  await t.test('a prototype-named slug 404s on every markdown shape', async () => {
    // The registry is an object literal, so `VERSIONED['constructor']` resolved up the prototype
    // chain to a function and the resolver's `?.find` threw rather than short-circuiting: an
    // unhandled 500 on a URL anyone, an ordinary crawler included, can send. The HTML shape was
    // never affected, because that route carries `dynamicParams = false`. The markdown route
    // permits dynamic params for proxy rewrites, so `versionSources` guards the lookup itself.
    for (const path of [
      '/docs/constructor/v1.md',
      '/docs/toString/v1.md',
      '/llms.mdx/docs/constructor/v1/content.md',
      '/llms.mdx/docs/toString/v1/content.md',
      '/llms.mdx/docs/__proto__/v1/content.md',
      '/llms.mdx/docs/valueOf/anything/content.md',
    ]) {
      const response = await get(path);
      assert.equal(response.status, 404, path);
      await response.text();
    }
    const negotiated = await get('/docs/constructor/v1', { headers: { accept: 'text/markdown' } });
    assert.equal(negotiated.status, 404);
    await negotiated.text();
  });

  await t.test('the docs 404 is the same response as the root 404', async () => {
    // Both are the one prerendered `/_not-found` output, so they are byte identical. A divergence
    // means `/docs/*` has stopped falling through to it, which is how FS-2688 regresses.
    const [root, docs] = await Promise.all([get('/does-not-exist'), get('/docs/does-not-exist')]);
    assert.equal(root.status, 404);
    assert.equal(docs.status, 404);
    assert.equal(await docs.text(), await root.text());
    for (const response of [root, docs]) {
      assert.match(response.headers.get('cache-control') ?? '', /no-store/);
    }
  });

  await t.test('archives stay out of discovery and generated image routes', async () => {
    for (const path of ['/sitemap.xml', '/llms.txt', '/llms-full.txt']) {
      const response = await get(path);
      assert.equal(response.status, 200);
      assert.ok(!(await response.text()).includes(archivePath), path);
    }
    // The markdown mirror is the one archive URL that exists on purpose (FS-2711); an archive
    // still gets no OG image of its own, and none of the three discovery files above names one.
    const og = await get(`/og${archivePath}/image.png`);
    assert.equal(og.status, 404);
    await og.text();
  });
});

test('markdown mirrors carry no MDX comments', { skip: !baseUrl }, async (t) => {
  // FS-2732. `{/* … */}` never reached the HTML, but the mirrors are stringified from the same
  // mdast, so every maintainer note in `content/` was served to the one audience that cannot see
  // the file it talks about. Three shapes are checked because each proves something the others
  // cannot: a page whose comments all arrive through an included partial, an archive (the
  // `docsVersions` collection sets `includeProcessedMarkdown` separately, and its comments arrive
  // inside a `<Tab>`), and the site-wide concatenation.
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

  await t.test('an archive mirror is clean and still carries its archived body', async () => {
    for (const path of [`${archivePath}.md`, archiveMirror]) {
      const response = await get(path);
      assert.equal(response.status, 200, path);
      const body = await response.text();
      noComments(body, path);
      assert.ok(body.includes(archivedText), path);
    }
  });

  await t.test('llms-full.txt is clean site-wide', async () => {
    // The assertion that cannot go vacuous: 100 comments lived here, spread over ~80 pages, so it
    // keeps meaning something however any single page is edited.
    const response = await get('/llms-full.txt');
    assert.equal(response.status, 200);
    const body = await response.text();
    noComments(body, '/llms-full.txt');
    assert.ok(body.length > 100_000);
  });
});

test('well-known MCP discovery card', { skip: !baseUrl }, async (t) => {
  const cardPath = '/.well-known/mcp/server-card.json';

  await t.test('serves the card as JSON, whatever the client will accept', async () => {
    // `/.well-known/` is on the proxy's bypass list. A client discovering the MCP server sends
    // whatever Accept header it likes, and every one of them must get the file on disk rather than
    // a negotiated markdown body, so both headers are asserted here.
    for (const accept of ['application/json', 'text/markdown']) {
      const response = await get(cardPath, { headers: { accept } });
      assert.equal(response.status, 200, accept);
      assert.match(response.headers.get('content-type') ?? '', /application\/json/, accept);
      // Annotated, not validated: a card missing `transport` throws on the property read below,
      // exactly as it did before the file was TypeScript.
      const card: { transport: { type: string; endpoint: string } } = JSON.parse(
        await response.text(),
      );
      assert.equal(card.transport.type, 'streamable-http');
      assert.equal(card.transport.endpoint, 'https://mcp.inkeep.com/offchainlabs/mcp');
    }
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
  // FS-2713. The site root shipped with no <title>, no description, no canonical and no social
  // tags at all, while every docs page had the lot. These assertions run against the built HTML
  // because that is the only place the answer lives: `types:check` proves the Metadata object
  // compiles, not that Next emitted a tag from it.
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
    // `app/(home)/opengraph-image.tsx` is served from `/opengraph-image-<hash>`, where the suffix
    // is Next's and not ours. Following the URL out of the document is the only way to assert the
    // tag points at something rather than at a 404. It also proves the route answers with a real
    // PNG even under a markdown-preferring Accept header, though that is not because of the
    // `/opengraph-image` proxy bypass entry: both negotiation patterns in proxy.ts are anchored at
    // `/docs`, so this path never reaches them regardless of the bypass (see the comment there).
    const html = await head('/');
    const image = meta(html, 'og:image');
    assert.ok(image, 'no og:image on /');
    assert.equal(meta(html, 'twitter:image'), image);
    assert.equal(meta(html, 'og:image:width'), '1200');
    assert.equal(meta(html, 'og:image:height'), '630');

    const url = new URL(image);
    const response = await get(`${url.pathname}${url.search}`, {
      headers: { accept: 'text/markdown' },
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /image\/png/);
    assert.ok((await response.arrayBuffer()).byteLength > 1024);
  });

  await t.test('the root and the docs landing page do not share a title', async () => {
    // `/` and `/docs` are two separately indexable portal pages. Giving them one title would make
    // each compete with the other for the same query, which is why the root does not simply reuse
    // `content/docs/index.mdx`'s "Arbitrum docs". See lib/shared.ts.
    const [root, docs] = await Promise.all([head('/'), head('/docs')]);
    assert.notEqual(title(root), title(docs));
    assert.notEqual(meta(root, 'description'), meta(docs, 'description'));
  });
});

test('docs page open graph tags', { skip: !baseUrl }, async (t) => {
  // FS-2724. A docs page emitted og:title/description/image but neither og:site_name nor og:type,
  // unlike the root (FS-2713, above). Follows that test's shape.
  await t.test(
    'a live page carries og:site_name, og:type, og:url and a modified time',
    async () => {
      const html = await head(livePath);
      assert.equal(meta(html, 'og:site_name'), appName);
      assert.equal(meta(html, 'og:type'), 'article');
      // `og:url` is the same string the canonical carries; the two are one claim to two readers.
      assert.equal(meta(html, 'og:url'), tag(html, /<link rel="canonical" href="([^"]*)"/));
      assertModifiedTimeMatchesBody(html, livePath);
      // Untouched by this ticket: still the per-page title/description/image, not the root's.
      assert.equal(meta(html, 'og:title'), title(html));
      assert.ok(meta(html, 'og:image'), 'no og:image on a docs page');
    },
  );

  await t.test(
    'an archive carries the same og:site_name and og:type as the live page',
    async () => {
      // Archives are noindex, follow (asserted in the "archives render their own body" test above),
      // but og:site_name/og:type describe what the object is, not whether it should be indexed, so
      // an archive gets them too.
      const [live, archive] = await Promise.all([head(livePath), head(archivePath)]);
      assert.equal(meta(archive, 'og:site_name'), meta(live, 'og:site_name'));
      assert.equal(meta(archive, 'og:type'), meta(live, 'og:type'));
      // An archive is a version of the live document, not a second document, so its `og:url`
      // points at the live page exactly as its canonical does.
      assert.equal(meta(archive, 'og:url'), meta(live, 'og:url'));
      // The archive's own modified time, from `content/_versions/v1/...`'s own git history, not
      // necessarily distinct from the live page's (both files can share a last-touching commit,
      // as they do for this fixture today).
      assertModifiedTimeMatchesBody(archive, archivePath);
    },
  );

  await t.test('the docs landing page is typed like every other page under /docs', async () => {
    // Deliberate and documented (INTERNALS.md, "Page metadata"): nothing in the collection marks a
    // page as an index, so `/docs` and the section landings take the same `article` as a leaf page
    // rather than a hand-kept list of URLs that goes stale silently. `/` is the one `website`, and
    // the home page suite above pins that, so this assertion is what records that the split is
    // root-versus-docs and not index-versus-document.
    const docs = await head('/docs');
    assert.equal(meta(docs, 'og:type'), 'article');
    assert.equal(meta(docs, 'og:site_name'), appName);
  });
});

test('the contribute guide links back into this repository', { skip: !baseUrl }, async (t) => {
  /**
   * The rendered half of FS-2733. `scripts/lib/contribute-repo-links.test.ts` asserts the same
   * rule over the source file and needs no server; this one is what proves the
   * `{var:docsRepositoryUrl}` placeholders actually expanded, rather than reaching the reader as
   * literal braces inside an href. Nothing else would notice: `check-links` skips an external
   * destination, and a wrong-but-well-formed GitHub URL still renders as a link.
   */
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
    // The second reader-facing "file an issue about these docs" link, found by the round 1 review
    // of FS-2733 naming the other repository while the "Request an update" button beside it named
    // this one. It is a different partial on a different page, so `/docs/contribute` above cannot
    // see it.
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
