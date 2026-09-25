import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  admonitionsToComponents,
  includeDirective,
  inlineVars,
  normalizeContentType,
  partialImportsToIncludes,
  quicklooksToTerms,
  remapFrontmatter,
  resolveLinkTarget,
  resolveSpecifier,
  rewriteInternalLinks,
} from './pr-dialect.mjs';

const fm = (lines, body = 'Body.\n') => `---\n${lines.join('\n')}\n---\n\n${body}`;

describe('remapFrontmatter (doc)', () => {
  it('maps a legacy content_type onto the closed enum and quotes it', () => {
    const out = remapFrontmatter(
      fm(['title: T', 'description: D', 'content_type: gentle-introduction', 'author: a']),
    );
    assert.match(out, /^content_type: 'concept'$/m);
  });

  it('defaults a missing content_type to concept', () => {
    const out = remapFrontmatter(fm(['title: T', 'description: D', 'author: a']));
    assert.match(out, /^content_type: 'concept'$/m);
  });

  it('fills sme from author, and author from the default', () => {
    const withAuthor = remapFrontmatter(fm(['title: T', 'description: D', 'author: mahsa']));
    assert.match(withAuthor, /^sme: mahsa$/m);

    const without = remapFrontmatter(fm(['title: T', 'description: D']));
    assert.match(without, /^author: gblanchemain$/m);
    assert.match(without, /^sme: gblanchemain$/m);
  });

  it('keeps an explicit sme', () => {
    const out = remapFrontmatter(fm(['title: T', 'description: D', 'author: a', 'sme: b']));
    assert.match(out, /^sme: b$/m);
    assert.doesNotMatch(out, /^sme: a$/m);
  });

  // The migration splits this transform across two commits so that `.git-blame-ignore-revs` can
  // list the form-only half and exclude the half that invents `author`/`sme`. An ignored commit
  // reassigns its lines to the previous commit that touched them, so hiding the synthesised names
  // would attribute a claim about a person to whoever last edited that frontmatter block.
  describe('authorship synthesis is separable', () => {
    it('omits author and sme when synthesizeAuthorship is false', () => {
      const out = remapFrontmatter(fm(['title: T', 'description: D']), {
        synthesizeAuthorship: false,
      });
      assert.doesNotMatch(out, /^author:/m);
      assert.doesNotMatch(out, /^sme:/m);
    });

    it('still applies the form changes without authorship', () => {
      const out = remapFrontmatter(fm(['title: T', 'description: D', 'id: legacy-id']), {
        synthesizeAuthorship: false,
      });
      assert.match(out, /^content_type: 'concept'$/m);
      assert.doesNotMatch(out, /^id:/m);
    });

    it('leaves an existing author and sme alone', () => {
      const out = remapFrontmatter(fm(['title: T', 'description: D', 'author: a', 'sme: b']), {
        synthesizeAuthorship: false,
      });
      assert.match(out, /^author: a$/m);
      assert.match(out, /^sme: b$/m);
    });

    // The whole point of the split: the two commits must compose to the single-commit result,
    // byte for byte, or the rebuilt branch no longer matches the shipped tree.
    for (const [name, lines] of [
      ['no authorship', ['title: T', 'description: D']],
      ['author only', ['title: T', 'description: D', 'author: mahsa']],
      ['author and sme', ['title: T', 'description: D', 'author: a', 'sme: b']],
      ['legacy keys', ['title: T', 'description: D', 'id: x', 'sidebar_position: 3']],
      ['legacy content_type', ['title: T', 'description: D', 'content_type: gentle-introduction']],
    ]) {
      it(`T1a then T1b equals T1 for: ${name}`, () => {
        const src = fm(lines);
        const t1a = remapFrontmatter(src, { synthesizeAuthorship: false });
        const split = remapFrontmatter(t1a);
        assert.equal(split, remapFrontmatter(src));
      });
    }
  });

  it('drops the Docusaurus-only keys', () => {
    const out = remapFrontmatter(
      fm([
        'title: T',
        'description: D',
        'id: legacy-id',
        'slug: /x',
        'sidebar_position: 3',
        'displayed_sidebar: mainSidebar',
        'target_audience: devs',
        'author: a',
      ]),
    );
    for (const key of [
      'id:',
      'slug:',
      'sidebar_position:',
      'displayed_sidebar:',
      'target_audience:',
    ])
      assert.doesNotMatch(out, new RegExp(`^${key}`, 'm'), key);
  });

  it('emits the canonical key order', () => {
    const out = remapFrontmatter(
      fm(['author: a', 'content_type: how-to', 'title: T', 'description: D', 'user_story: U']),
    );
    const keys = out
      .split('---')[1]
      .trim()
      .split('\n')
      .map((l) => l.split(':')[0]);
    assert.deepEqual(keys, ['title', 'description', 'user_story', 'content_type', 'author', 'sme']);
  });

  it('preserves a value verbatim, including quoting and embedded colons', () => {
    const out = remapFrontmatter(
      fm([`title: 'Quickstart: Arbitrum bridge'`, 'description: "a: b"', 'author: a']),
    );
    assert.match(out, /^title: 'Quickstart: Arbitrum bridge'$/m);
    assert.match(out, /^description: "a: b"$/m);
  });

  it('keeps a multi-line value attached to its key', () => {
    const out = remapFrontmatter(fm(['title: T', 'description: >', '  wrapped text', 'author: a']));
    assert.match(out, /^description: >\n {2}wrapped text$/m);
  });

  it('leaves a file with no frontmatter alone', () => {
    assert.equal(remapFrontmatter('Just a partial.\n'), 'Just a partial.\n');
  });

  it('leaves the body byte-identical', () => {
    const body = 'Line one.\n\n:::note\nkeep\n:::\n';
    const out = remapFrontmatter(fm(['title: T', 'description: D', 'author: a'], body));
    assert.ok(out.endsWith('\n' + body));
  });
});

describe('remapFrontmatter (glossary)', () => {
  it('turns key/titleforSort into id/sortAs', () => {
    const out = remapFrontmatter(
      fm(['title: Activation', 'key: activation', 'titleforSort: Zactivation']),
      { kind: 'glossary' },
    );
    assert.match(out, /^id: activation$/m);
    assert.match(out, /^title: 'Activation'$/m);
    assert.match(out, /^sortAs: 'Zactivation'$/m);
  });

  it('drops sortAs when it only repeats the title', () => {
    const out = remapFrontmatter(
      fm(['title: Activation', 'key: activation', 'titleforSort: Activation']),
      { kind: 'glossary' },
    );
    assert.doesNotMatch(out, /sortAs/);
  });

  it('leaves an entry with no key alone rather than inventing an id', () => {
    const src = fm(['title: Activation']);
    assert.equal(remapFrontmatter(src, { kind: 'glossary' }), src);
  });
});

describe('normalizeContentType', () => {
  it('passes through a valid value', () => {
    assert.equal(normalizeContentType('how-to'), 'how-to');
  });
  it('maps every documented alias', () => {
    assert.equal(normalizeContentType('overview'), 'concept');
    assert.equal(normalizeContentType('notice'), 'concept');
    assert.equal(normalizeContentType('interactive-visualization'), 'concept');
    assert.equal(normalizeContentType('get-started'), 'quickstart');
  });
  it('defaults anything unknown to concept', () => {
    assert.equal(normalizeContentType(''), 'concept');
    assert.equal(normalizeContentType(undefined), 'concept');
    assert.equal(normalizeContentType('made-up'), 'concept');
  });
});

describe('rewriteInternalLinks', () => {
  const urls = new Map([
    ['docs/arbitrum-bridge/03-troubleshooting', '/docs/arbitrum-bridge/troubleshooting'],
    ['docs/for-devs/dev-tools-and-resources/chain-info', '/docs/chain-info'],
    ['docs/intro/intro', '/docs'],
  ]);
  const resolveUrl = (k) => urls.get(k) ?? null;
  const from = 'docs/arbitrum-bridge/01-quickstart.mdx';

  it('rewrites an absolute .mdx link', () => {
    assert.equal(
      rewriteInternalLinks('see [t](/arbitrum-bridge/03-troubleshooting.mdx).', {
        fromLegacyPath: from,
        resolveUrl,
      }),
      'see [t](/docs/arbitrum-bridge/troubleshooting).',
    );
  });

  it('resolves a relative link and keeps its anchor', () => {
    assert.equal(
      rewriteInternalLinks('[f](../for-devs/dev-tools-and-resources/chain-info#faucet-list)', {
        fromLegacyPath: from,
        resolveUrl,
      }),
      '[f](/docs/chain-info#faucet-list)',
    );
  });

  it('maps a page whose destination is an index to the bare section URL', () => {
    assert.equal(
      rewriteInternalLinks('[i](/intro/intro.mdx)', { fromLegacyPath: from, resolveUrl }),
      '[i](/docs)',
    );
  });

  it('leaves external, mail and anchor targets alone', () => {
    const src = '[a](https://x.dev/y) [b](mailto:x@y.z) [c](#section)';
    assert.equal(rewriteInternalLinks(src, { fromLegacyPath: from, resolveUrl }), src);
  });

  it('leaves an unresolvable internal target untouched rather than guessing', () => {
    const src = '[x](/never/migrated.mdx)';
    assert.equal(rewriteInternalLinks(src, { fromLegacyPath: from, resolveUrl }), src);
  });

  it('resolveLinkTarget reports null for a target it cannot place', () => {
    assert.equal(resolveLinkTarget('https://x.dev', from, resolveUrl), null);
    assert.equal(resolveLinkTarget('#anchor', from, resolveUrl), null);
    assert.equal(resolveLinkTarget('', from, resolveUrl), null);
  });
});

describe('quicklooksToTerms', () => {
  it('converts a flow link', () => {
    assert.equal(
      quicklooksToTerms('a <a data-quicklook-from="parent-chain">parent chain</a> b'),
      'a <Term id="parent-chain">parent chain</Term> b',
    );
  });

  it('accepts single quotes and a stray space after the equals sign', () => {
    assert.equal(quicklooksToTerms("<a data-quicklook-from = 'x'>y</a>"), '<Term id="x">y</Term>');
  });

  it('unwraps a link nested inside a string attribute, in both modes', () => {
    const src = '<VanillaAdmonition title="see <a data-quicklook-from=&quot;k&quot;>t</a> now">';
    assert.equal(quicklooksToTerms(src), '<VanillaAdmonition title="see t now">');
    assert.equal(quicklooksToTerms(src, { unwrap: true }), '<VanillaAdmonition title="see t now">');
  });

  it('unwraps every link when asked (the shape partials need)', () => {
    assert.equal(quicklooksToTerms('<a data-quicklook-from="x">y</a>', { unwrap: true }), 'y');
  });

  it('leaves an ordinary anchor alone', () => {
    const src = '<a href="https://x.dev">y</a>';
    assert.equal(quicklooksToTerms(src), src);
  });
});

describe('admonitionsToComponents', () => {
  it('converts a titled admonition', () => {
    const src = ':::info Bridging **USDC**?\n\nbody\n\n:::\n';
    assert.equal(
      admonitionsToComponents(src),
      '<VanillaAdmonition type="info" title="Bridging **USDC**?">\n\nbody\n\n</VanillaAdmonition>\n',
    );
  });

  it('converts an untitled admonition without an empty title attribute', () => {
    assert.equal(
      admonitionsToComponents(':::note\n\nbody\n\n:::\n'),
      '<VanillaAdmonition type="note">\n\nbody\n\n</VanillaAdmonition>\n',
    );
  });

  it('escapes a double quote in the title', () => {
    assert.match(
      admonitionsToComponents(':::tip say "hi"\n\nb\n\n:::\n'),
      /title="say &quot;hi&quot;"/,
    );
  });

  it('does not touch a ::: inside a fenced code block', () => {
    const src = '```\n:::note\n:::\n```\n';
    assert.equal(admonitionsToComponents(src), src);
  });

  it('converts a nested :::: admonition, matching closers by marker length', () => {
    assert.equal(
      admonitionsToComponents('::::note\n:::tip\n:::\n::::\n'),
      '<VanillaAdmonition type="note">\n<VanillaAdmonition type="tip">\n</VanillaAdmonition>\n</VanillaAdmonition>\n',
    );
  });

  it('bails out when a closer does not match the marker length of its opener', () => {
    const src = '::::note\nbody\n:::\n';
    assert.equal(admonitionsToComponents(src), src);
  });

  it('tracks fence length so a ```` block containing ``` does not desync', () => {
    const src = '````shell\n```bash\nx\n```\n````\n\n:::note\n\nb\n\n:::\n';
    assert.equal(
      admonitionsToComponents(src),
      '````shell\n```bash\nx\n```\n````\n\n<VanillaAdmonition type="note">\n\nb\n\n</VanillaAdmonition>\n',
    );
  });

  it('bails out on an unbalanced admonition', () => {
    const src = ':::note\nbody\n';
    assert.equal(admonitionsToComponents(src), src);
  });

  it('converts details/summary to an accordion', () => {
    assert.equal(
      admonitionsToComponents('<details>\n<summary>Rust toolchain</summary>\n\nb\n\n</details>\n'),
      '<Accordions>\n<Accordion title="Rust toolchain">\n\nb\n\n</Accordion>\n</Accordions>\n',
    );
  });

  it('leaves unbalanced details markup alone', () => {
    const src = '<details>\n<summary>S</summary>\n\nb\n';
    assert.equal(admonitionsToComponents(src), src);
  });
});

describe('partialImportsToIncludes', () => {
  const ctx = {
    fromLegacyPath: 'docs/arbitrum-bridge/03-troubleshooting.mdx',
    toDestPath: 'content/docs/arbitrum-bridge/troubleshooting.mdx',
    resolvePartial: (p) =>
      p === 'docs/arbitrum-bridge/partials/_faq.mdx' ? 'content/partials/_faq.mdx' : null,
  };

  it('removes the import and replaces the usage with a root-anchored include', () => {
    const src = "import FAQ from '../arbitrum-bridge/partials/_faq.mdx';\n\ntext\n\n<FAQ />\n";
    assert.equal(
      partialImportsToIncludes(src, ctx),
      '\ntext\n\n<include cwd>content/partials/_faq.mdx</include>\n',
    );
  });

  it('handles the paired-tag usage form', () => {
    const src = "import FAQ from '../arbitrum-bridge/partials/_faq.mdx';\n<FAQ></FAQ>\n";
    assert.equal(
      partialImportsToIncludes(src, ctx),
      '<include cwd>content/partials/_faq.mdx</include>\n',
    );
  });

  it('leaves an import it cannot resolve in place, with its usage', () => {
    const src = "import X from './partials/_gone.mdx';\n\n<X />\n";
    assert.equal(partialImportsToIncludes(src, ctx), src);
  });

  it('emits a file-relative include when the including file is itself a partial', () => {
    assert.equal(
      includeDirective('content/partials/a/_x.mdx', 'content/partials/b/_y.mdx'),
      '<include>../b/_y.mdx</include>',
    );
  });

  it('resolveSpecifier understands @site/ and relative specifiers', () => {
    assert.equal(
      resolveSpecifier('@site/docs/partials/_x.mdx', 'docs/a/b.mdx'),
      'docs/partials/_x.mdx',
    );
    assert.equal(resolveSpecifier('../partials/_x.mdx', 'docs/a/b.mdx'), 'docs/partials/_x.mdx');
    assert.equal(resolveSpecifier('react', 'docs/a/b.mdx'), null);
  });
});

describe('inlineVars', () => {
  const knownVars = new Set(['nitroVersionTag']);

  it('replaces a registered variable with the Var component', () => {
    assert.equal(
      inlineVars('blob/@@nitroVersionTag=v3.11.3@@/x', { knownVars }),
      'blob/<Var name="nitroVersionTag" />/x',
    );
  });

  it('collapses an unregistered variable to the value already in the text', () => {
    assert.equal(
      inlineVars('v@@stylusRustToolchain=1.91@@ or newer', { knownVars }),
      'v1.91 or newer',
    );
  });

  it('handles several occurrences on one line', () => {
    assert.equal(
      inlineVars('@@a=1@@ and @@nitroVersionTag=v1@@', { knownVars }),
      '1 and <Var name="nitroVersionTag" />',
    );
  });

  it('leaves text with no variables untouched', () => {
    assert.equal(inlineVars('plain @ text', { knownVars }), 'plain @ text');
  });
});
