/**
 * Tests for the precompile-table parser and renderer (FS-2730).
 *
 * `scripts/generate-precompile-tables.ts` cannot be imported for a unit test: it calls
 * `runScript(main)` at module scope and every path to `writeOrCheck` runs through a `fetch` of a
 * pinned GitHub commit, so its only end-to-end guard used to be `pnpm precompiles:check`, which is
 * network-bound and `continue-on-error` in CI. This exercises the pure parse/render functions the
 * runner now delegates to, against small fixture Solidity/Go source, entirely offline.
 *
 * Fixture source stands in for the real Nitro/nitro-precompile-interfaces trees so the assertions
 * stay pinned to the parsing and rendering rules rather than to whatever a pinned commit happens to
 * contain today: a real source change should show up as a diff in the generated partial, never as
 * a red test here.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEPRECATION_NOTICE,
  type EventOverride,
  type MethodOverride,
  NODE_INTERFACE_MARKER,
  type Overrides,
  PRECOMPILE_MARKER,
  assertResolved,
  buildSourceUrls,
  extractDocComment,
  lowercaseKeys,
  renderEventsInTable,
  renderMethodsInTable,
  renderNodeInterfacePartial,
  renderPrecompilePartial,
  toRawUrl,
} from './precompile-tables.ts';

const INTERFACE_URL =
  'https://github.com/OffchainLabs/nitro-precompile-interfaces/blob/deadbeef/ArbFixture.sol';
const IMPLEMENTATION_URL =
  'https://github.com/OffchainLabs/nitro/blob/v3.11.3/precompiles/ArbFixture.go';

/**
 * A small Solidity interface exercising: a single-line signature with a doc comment, a
 * multi-line signature (the parameter list spans several lines, which `renderMethodsInTable`
 * must concatenate forward until it finds the closing paren), a method with no doc comment
 * (should render an empty description cell, not a placeholder; see the note on that test
 * below), an event with a doc comment, and an event that is declared but never emitted from
 * the fixture's Go source (falls back to its first mention).
 */
const INTERFACE_SOURCE = `// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.21 <0.9.0;

interface ArbFixture {
    // ArbBlockNumber gets the current L2 block number
    function arbBlockNumber() external view returns (uint256);

    // MultiLine takes several
    // arguments split across lines
    function multiLine(
        uint256 a,
        uint256 b
    ) external view returns (uint256);

    function noComment() external view returns (uint256);

    // Emitted when something happens
    event Something(uint256 indexed value);

    event NeverEmitted(uint256 value);
}
`;

/** The Go side pairing every declaration above by name, plus one emit site for `Something`. */
const IMPLEMENTATION_SOURCE = `package precompiles

// ArbBlockNumber gets the current L2 block number
func (con *ArbFixture) ArbBlockNumber(c ctx, evm mech) (huge, error) {
	return nil, nil
}

func (con *ArbFixture) MultiLine(c ctx, evm mech, a huge, b huge) (huge, error) {
	return nil, nil
}

func (con *ArbFixture) NoComment(c ctx, evm mech) (huge, error) {
	return nil, nil
}

func (con *ArbFixture) EmitSomething(c ctx, evm mech, value huge) error {
	con.Something(c, evm, value)
	return nil
}

// NeverEmitted is declared but never actually emitted in this fixture.
var neverEmittedNote = "NeverEmitted"
`;

/** Line number (1-based) of the first line containing `needle` in `source`. */
function lineOf(source: string, needle: string): number {
  const idx = source.split('\n').findIndex((line) => line.includes(needle));
  assert.notEqual(idx, -1, `fixture line not found: ${needle}`);
  return idx + 1;
}

describe('toRawUrl', () => {
  it('rewrites a GitHub blob URL to its raw host and drops the blob/ segment', () => {
    assert.equal(
      toRawUrl('https://github.com/OffchainLabs/nitro/blob/v3.11.3/precompiles/ArbSys.go'),
      'https://raw.githubusercontent.com/OffchainLabs/nitro/v3.11.3/precompiles/ArbSys.go',
    );
  });
});

describe('extractDocComment', () => {
  it('joins consecutive // lines directly above a declaration', () => {
    const lines = ['// line one', '// line two', 'func Foo() {}'];
    assert.equal(extractDocComment(lines, 2), 'line one line two');
  });

  it('returns an empty string when no comment directly precedes the declaration', () => {
    const lines = ['// unrelated, separated by a blank line', '', 'func Foo() {}'];
    assert.equal(extractDocComment(lines, 2), '');
  });
});

describe('lowercaseKeys', () => {
  it('lowercases every key, leaving values untouched', () => {
    assert.deepEqual(lowercaseKeys({ GetTxBaseFee: { deprecated: true } }), {
      gettxbasefee: { deprecated: true },
    });
  });
});

describe('assertResolved', () => {
  it('does not throw when every entry has a non-zero implementationLine', () => {
    assert.doesNotThrow(() =>
      assertResolved({ foo: { name: 'Foo', implementationLine: 4, interfaceLine: 1 } }, 'method'),
    );
  });

  it('throws naming the kind, the signature, and the interface line when unresolved', () => {
    assert.throws(
      () =>
        assertResolved(
          { foo: { signature: 'foo()', implementationLine: 0, interfaceLine: 7 } },
          'method',
        ),
      /no Go reference found for method "foo\(\)" \(interface line 7\)/,
    );
  });
});

describe('renderMethodsInTable', () => {
  const render = (overrides?: Overrides<MethodOverride>) =>
    renderMethodsInTable(
      INTERFACE_SOURCE,
      IMPLEMENTATION_SOURCE,
      INTERFACE_URL,
      IMPLEMENTATION_URL,
      overrides,
    );

  it('pairs a single-line signature with its Go doc comment and line numbers', () => {
    const html = render();
    const interfaceLine = lineOf(INTERFACE_SOURCE, 'function arbBlockNumber(');
    const implementationLine = lineOf(
      IMPLEMENTATION_SOURCE,
      'func (con *ArbFixture) ArbBlockNumber(',
    );
    assert.match(html, /<code>arbBlockNumber\(\)<\/code>/);
    assert.match(html, new RegExp(`${INTERFACE_URL}#L${interfaceLine}`));
    assert.match(html, new RegExp(`${IMPLEMENTATION_URL}#L${implementationLine}`));
    assert.match(html, /<td>ArbBlockNumber gets the current L2 block number<\/td>/);
  });

  it('concatenates a signature whose parameter list spans several lines', () => {
    const html = render();
    // The parser must stop at the multiLine declaration's own closing paren, not at
    // noComment's. A regression here would misattribute the interface line or truncate the
    // signature.
    assert.match(html, /<code>multiLine\(uint256 a, uint256 b\)<\/code>/);
  });

  it('renders an empty description cell for a method with no doc comment, not a placeholder', () => {
    // This preserves current behavior on purpose: two committed partials
    // (content/partials/precompile-tables/_ArbOwner.mdx and _ArbOwnerPublic.mdx) already ship a
    // genuinely blank <td></td> for a method with no preceding // comment, and
    // `precompiles:generate` output for the current pins must stay byte-identical across this
    // refactor (FS-2730). Introducing placeholder copy here would change that committed output.
    const html = render();
    const row = html.match(/<tr>\s*<td><code>noComment\(\)<\/code><\/td>[\s\S]*?<\/tr>/);
    assert.ok(row, 'expected a table row for noComment()');
    assert.match(row[0], /<td><\/td>\s*<\/tr>$/, 'description cell must be empty');
  });

  it('flags a deprecated override with the warning glyph and appends the deprecation notice', () => {
    const html = render({ multiline: { deprecated: true } });
    assert.match(html, /<td>⚠️<code>multiLine\(uint256 a, uint256 b\)<\/code><\/td>/);
    assert.ok(html.includes(DEPRECATION_NOTICE));
  });

  it('omits the deprecation notice when nothing is deprecated', () => {
    const html = render();
    assert.ok(!html.includes(DEPRECATION_NOTICE));
  });

  it('appends the ArbOS availability suffix from an override', () => {
    const html = render({ arbblocknumber: { availableSinceArbOS: 30 } });
    assert.match(
      html,
      /<td>ArbBlockNumber gets the current L2 block number \(Available since ArbOS 30\)<\/td>/,
    );
  });

  it('matches overrides case-insensitively', () => {
    const lower = render({ MULTILINE: { deprecated: true } });
    const upper = render({ multiline: { deprecated: true } });
    assert.equal(lower, upper);
  });

  it('throws when a declared method has no Go counterpart and no override', () => {
    const brokenInterface = `interface Broken {
    function neverImplemented() external view returns (uint256);
}
`;
    const emptyImplementation = `package precompiles
`;
    assert.throws(
      () =>
        renderMethodsInTable(
          brokenInterface,
          emptyImplementation,
          INTERFACE_URL,
          IMPLEMENTATION_URL,
          undefined,
        ),
      /no Go reference found for method "neverImplemented\(\)"/,
    );
  });
});

describe('renderEventsInTable', () => {
  const render = (overrides?: Overrides<EventOverride>) =>
    renderEventsInTable(
      INTERFACE_SOURCE,
      IMPLEMENTATION_SOURCE,
      INTERFACE_URL,
      IMPLEMENTATION_URL,
      overrides,
    );

  it('resolves an emitted event to its con.<Event>( call site', () => {
    const html = render();
    const interfaceLine = lineOf(INTERFACE_SOURCE, 'event Something(');
    const implementationLine = lineOf(IMPLEMENTATION_SOURCE, 'con.Something(');
    assert.match(html, /<code>Something<\/code>/);
    assert.match(html, new RegExp(`${INTERFACE_URL}#L${interfaceLine}`));
    assert.match(html, new RegExp(`${IMPLEMENTATION_URL}#L${implementationLine}`));
    assert.match(html, /<td>Emitted when something happens<\/td>/);
  });

  it('falls back to the first mention of an event never emitted via con.<Event>(', () => {
    const html = render();
    const fallbackLine = lineOf(IMPLEMENTATION_SOURCE, 'NeverEmitted');
    assert.match(html, /<code>NeverEmitted<\/code>/);
    assert.match(html, new RegExp(`${IMPLEMENTATION_URL}#L${fallbackLine}`));
  });

  it('overrides an event description case-insensitively', () => {
    const html = render({ NEVEREMITTED: { description: 'Overridden description' } });
    assert.match(html, /<code>NeverEmitted<\/code>[\s\S]*?<td>Overridden description<\/td>/);
  });

  it('returns an empty string when the interface declares no events', () => {
    assert.equal(
      renderEventsInTable(
        'interface Empty {}',
        IMPLEMENTATION_SOURCE,
        INTERFACE_URL,
        IMPLEMENTATION_URL,
      ),
      '',
    );
  });

  it('throws when a declared event is never mentioned anywhere in the Go source', () => {
    const brokenInterface = `interface Broken {
    event NeverMentioned(uint256 value);
}
`;
    const emptyImplementation = `package precompiles
`;
    assert.throws(
      () =>
        renderEventsInTable(
          brokenInterface,
          emptyImplementation,
          INTERFACE_URL,
          IMPLEMENTATION_URL,
          undefined,
        ),
      /no Go reference found for event "NeverMentioned"/,
    );
  });
});

describe('renderPrecompilePartial', () => {
  const marker = PRECOMPILE_MARKER;
  // Called inside each `it`, not in the describe body: a throw during suite construction makes
  // `node --test` drop the suite's tests from the count and exit 0, so the gate would miss it.
  const render = () =>
    renderPrecompilePartial({
      marker,
      interfaceCode: INTERFACE_SOURCE,
      implementationCode: IMPLEMENTATION_SOURCE,
      interfaceUrl: INTERFACE_URL,
      implementationUrl: IMPLEMENTATION_URL,
    });

  it('opens with the marker on its own line, followed by a blank line', () => {
    const [first, second] = render().split('\n');
    assert.equal(first, marker);
    assert.equal(second, '');
  });

  it('includes both the methods table and the events table', () => {
    const content = render();
    assert.match(content, /<th>Method<\/th>/);
    assert.match(content, /<th>Event<\/th>/);
  });
});

describe('renderNodeInterfacePartial', () => {
  const render = () =>
    renderNodeInterfacePartial({
      marker: NODE_INTERFACE_MARKER,
      interfaceCode: INTERFACE_SOURCE,
      implementationCode: IMPLEMENTATION_SOURCE,
      interfaceUrl: INTERFACE_URL,
      implementationUrl: IMPLEMENTATION_URL,
    });

  it('opens with the NodeInterface marker on its own line, followed by a blank line', () => {
    const [first, second] = render().split('\n');
    assert.equal(first, NODE_INTERFACE_MARKER);
    assert.equal(second, '');
  });

  it('includes the methods table but no events table, unlike a precompile partial', () => {
    const content = render();
    assert.match(content, /<th>Method<\/th>/);
    assert.ok(!content.includes('<th>Event</th>'));
  });
});

describe('PRECOMPILE_MARKER and NODE_INTERFACE_MARKER', () => {
  const MARKER_SHAPE =
    /^\{\/\* AUTOGENERATED\. Do not edit by hand\. Run `pnpm precompiles:generate` after .+\. \*\/\}$/;

  it('both match the do-not-edit marker shape', () => {
    assert.match(PRECOMPILE_MARKER, MARKER_SHAPE);
    assert.match(NODE_INTERFACE_MARKER, MARKER_SHAPE);
  });

  it('are distinct, so a partial cannot silently carry the wrong one', () => {
    assert.notEqual(PRECOMPILE_MARKER, NODE_INTERFACE_MARKER);
  });
});

describe('buildSourceUrls', () => {
  const vars = {
    nitroPrecompilesRepositorySlug: 'nitro-precompile-interfaces',
    nitroPrecompilesCommit: 'cafe0123',
    nitroRepositorySlug: 'nitro',
    nitroVersionTag: 'v9.9.9',
    nitroPathToPrecompiles: 'precompiles',
  };
  const pins = {
    nitroContractsRepositorySlug: 'nitro-contracts',
    nitroContractsCommit: 'beef4567',
    nitroContractsPathToPrecompilesInterface: 'src/node-interface',
    nitroPrecompilesPathToInterfaces: '',
  };

  it('builds the four blob base URLs from the pins, each ending in a slash', () => {
    const urls = buildSourceUrls(vars, pins);
    assert.deepEqual(urls, {
      interfaceBaseUrl:
        'https://github.com/OffchainLabs/nitro-precompile-interfaces/blob/cafe0123/',
      implementationBaseUrl: 'https://github.com/OffchainLabs/nitro/blob/v9.9.9/precompiles/',
      nodeInterfaceInterfaceBaseUrl:
        'https://github.com/OffchainLabs/nitro-contracts/blob/beef4567/src/node-interface/',
      nodeInterfaceImplementationBaseUrl:
        'https://github.com/OffchainLabs/nitro/blob/v9.9.9/execution/nodeinterface/',
    });
    for (const url of Object.values(urls)) assert.ok(url.endsWith('/'), url);
  });

  it('inserts the interfaces subpath only when the pin is set', () => {
    const withPath = buildSourceUrls(vars, { ...pins, nitroPrecompilesPathToInterfaces: 'src' });
    assert.equal(
      withPath.interfaceBaseUrl,
      'https://github.com/OffchainLabs/nitro-precompile-interfaces/blob/cafe0123/src/',
    );
    assert.equal(
      buildSourceUrls(vars, pins).interfaceBaseUrl,
      'https://github.com/OffchainLabs/nitro-precompile-interfaces/blob/cafe0123/',
    );
  });

  it('turns each blob URL into the raw URL the runner fetches', () => {
    const { implementationBaseUrl } = buildSourceUrls(vars, pins);
    assert.equal(
      toRawUrl(`${implementationBaseUrl}ArbSys.go`),
      'https://raw.githubusercontent.com/OffchainLabs/nitro/v9.9.9/precompiles/ArbSys.go',
    );
  });
});
