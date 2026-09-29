/**
 * Parsing and rendering for the precompile-table partials.
 *
 * Kept separate from `scripts/generate-precompile-tables.ts` so this can be exercised
 * against fixture Solidity/Go source in `scripts/lib/precompile-tables.test.ts` without reaching
 * the network: the runner fetches every source from a pinned commit over `raw.githubusercontent.com`.
 * Everything here is pure
 * (no `fetch`, no `fs`); the runner supplies the fetched source text and does the writing.
 *
 * Ported from `scripts/generate-precompile-tables.ts`, unchanged in behavior. See that file's
 * history for the original arbitrum-docs source (`scripts/precompile-reference-generator.ts`).
 */
import { assertInertMdx, generatedMarker } from './generated-partial.ts';

/**
 * Hand-curated fields for one method, from `scripts/data/precompiles-information.ts`. Every field
 * is spread over the parsed entry, so an override can also replace the parsed signature or
 * description.
 */
export interface MethodOverride {
  signature?: string;
  description?: string;
  deprecated?: boolean;
  availableSinceArbOS?: number;
}

/** Hand-curated fields for one event, spread over the parsed entry like {@link MethodOverride}. */
export interface EventOverride {
  description?: string;
}

/** Overrides keyed by method or event name, matched case-insensitively. */
export type Overrides<T> = Record<string, T>;

/** One precompile's entry in `scripts/data/precompiles-information.ts`. */
export interface PrecompileInformation {
  methodOverrides?: Overrides<MethodOverride>;
  eventOverrides?: Overrides<EventOverride>;
}

/** What the parser reads off a Solidity `function` and the Go method implementing it. */
interface ParsedMethod {
  signature: string;
  interfaceLine: number;
  implementationLine: number;
  description: string;
}

/** What the parser reads off a Solidity `event` and the Go line emitting or naming it. */
interface ParsedEvent {
  name: string;
  interfaceLine: number;
  implementationLine: number;
  description: string;
}

/**
 * An entry after overrides are applied. Every parsed field is optional here because an override
 * naming a method or event the interface does not declare becomes an entry made of the override
 * alone, with no line numbers; {@link assertResolved} is what rejects it.
 */
type MethodEntry = Partial<ParsedMethod> & MethodOverride;
type EventEntry = Partial<ParsedEvent> & EventOverride;

/** The fields {@link assertResolved} reads, common to both entry kinds. */
export interface ResolvableEntry {
  signature?: string;
  name?: string;
  interfaceLine?: number;
  implementationLine?: number;
}

/** The `content/vars.json` pins the precompile source URLs are built from. */
export interface PrecompileSourceVars {
  nitroPrecompilesRepositorySlug: string;
  nitroPrecompilesCommit: string;
  nitroRepositorySlug: string;
  nitroVersionTag: string;
  nitroPathToPrecompiles: string;
  nitroPathToNodeInterface: string;
}

/** The runner's `NODE_INTERFACE_PINS`. */
export interface NodeInterfacePins {
  nitroContractsRepositorySlug: string;
  nitroContractsCommit: string;
  nitroContractsPathToPrecompilesInterface: string;
  nitroPrecompilesPathToInterfaces: string;
}

/** The four GitHub blob base URLs returned by {@link buildSourceUrls}. */
export interface SourceUrls {
  interfaceBaseUrl: string;
  implementationBaseUrl: string;
  nodeInterfaceInterfaceBaseUrl: string;
  nodeInterfaceImplementationBaseUrl: string;
}

/**
 * Opens every `_<Precompile>.mdx` partial. These files take every link they emit from six pins
 * across two files: `nitroPrecompilesRepositorySlug` and `nitroPrecompilesCommit` (the Solidity
 * interface), `nitroRepositorySlug`, `nitroVersionTag` and `nitroPathToPrecompiles` (the Go
 * implementation), all in `content/vars.json`, plus `NODE_INTERFACE_PINS
 * .nitroPrecompilesPathToInterfaces` in `scripts/generate-precompile-tables.ts`
 * (`nitroPathToNodeInterface` only feeds `_NodeInterface.mdx`). The marker names the two files
 * rather than the six pins so that it cannot go stale as pins are added, and so it fits on one
 * line in the fifteen partials that carry it.
 */
export const PRECOMPILE_MARKER = generatedMarker(
  'pnpm precompiles:generate',
  'bumping any pin in content/vars.json or scripts/generate-precompile-tables.ts',
);

/**
 * Opens `_NodeInterface.mdx`. That partial's Solidity interface comes from `nitro-contracts`,
 * not `nitro-precompile-interfaces`, so it reads `NODE_INTERFACE_PINS` (in
 * `scripts/generate-precompile-tables.ts`) instead of the `nitroPrecompiles*` vars.json pins;
 * its Go implementation still follows `nitroVersionTag`, `nitroRepositorySlug` and
 * `nitroPathToNodeInterface`. That is a short enough list to name in full, so this marker does,
 * and naming it is the only thing telling a `_NodeInterface.mdx` editor that
 * `nitroPrecompilesCommit` is not their lever. Both markers name the runner by path, because
 * "this script" has no referent for somebody reading the partial.
 */
export const NODE_INTERFACE_MARKER = generatedMarker(
  'pnpm precompiles:generate',
  'bumping nitroVersionTag, nitroRepositorySlug or nitroPathToNodeInterface in content/vars.json, ' +
    'or NODE_INTERFACE_PINS in scripts/generate-precompile-tables.ts',
);

export const DEPRECATION_NOTICE: string =
  '<p>Note: methods marked with ⚠️ are deprecated and their use is not supported.</p>';

/** GitHub blob URL → raw URL for the same ref. */
export const toRawUrl = (url: string): string =>
  url.replace('github.com', 'raw.githubusercontent.com').replace('blob/', '');

/**
 * The four GitHub blob base URLs every `<a href>` in the sixteen partials derives from. Pure so
 * the URL shape is pinned offline: `check-links` walks internal `/docs` links only, so a wrong
 * commit or path here would otherwise be visible to nothing but the network-bound
 * `pnpm precompiles:check`.
 *
 * `vars` is the parsed `content/vars.json`; `pins` is the runner's `NODE_INTERFACE_PINS`. Each
 * result ends in `/` so the caller appends `<Name>.sol` or `<Name>.go` directly.
 */
export function buildSourceUrls(vars: PrecompileSourceVars, pins: NodeInterfacePins): SourceUrls {
  const interfacePath = pins.nitroPrecompilesPathToInterfaces
    ? `/${pins.nitroPrecompilesPathToInterfaces}`
    : '';
  return {
    interfaceBaseUrl: `https://github.com/OffchainLabs/${vars.nitroPrecompilesRepositorySlug}/blob/${vars.nitroPrecompilesCommit}${interfacePath}/`,
    implementationBaseUrl: `https://github.com/OffchainLabs/${vars.nitroRepositorySlug}/blob/${vars.nitroVersionTag}/${vars.nitroPathToPrecompiles}/`,
    nodeInterfaceInterfaceBaseUrl: `https://github.com/OffchainLabs/${pins.nitroContractsRepositorySlug}/blob/${pins.nitroContractsCommit}/${pins.nitroContractsPathToPrecompilesInterface}/`,
    nodeInterfaceImplementationBaseUrl: `https://github.com/OffchainLabs/${vars.nitroRepositorySlug}/blob/${vars.nitroVersionTag}/${vars.nitroPathToNodeInterface}/`,
  };
}

/**
 * Join the consecutive `//` comment lines immediately above `lineIdx` into one
 * description. Handles multi-line doc comments in both Go and Solidity. Returns '' when
 * no comment directly precedes the declaration.
 */
export function extractDocComment(lines: string[], lineIdx: number): string {
  const commentLines: string[] = [];
  for (let j = lineIdx - 1; j >= 0; j--) {
    const trimmed = lines[j].trim();
    if (!trimmed.startsWith('//')) break;
    commentLines.unshift(trimmed.replace(/^\/\/+\s*/, ''));
  }
  return commentLines.join(' ').trim();
}

/**
 * Escape upstream text for a JSX text position (inside `<td>` or `<code>`).
 *
 * These tables are raw JSX, and in MDX a `{` there opens a JavaScript expression that runs in the
 * build and the browser, and a `<` opens an element (or fails the build on `a < b`). Each is
 * written as a character reference, which MDX decodes back to the same character on the page. An
 * `&` that does not already start a reference is escaped too, so `&lt;` in a Go comment still
 * reads `&lt;` rather than `<`.
 *
 * Applied to the parsed Solidity and Go text only. The hand-written overrides in
 * `scripts/data/precompiles-information.ts` are reviewed in this repo and use `<code>` on purpose.
 */
export function escapeJsxText(text: string): string {
  return text
    .replace(/&(?![A-Za-z][A-Za-z0-9]*;|#[0-9]+;|#[xX][0-9A-Fa-f]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

/** The elements the table renderers write. Anything else in a partial came from upstream. */
const TABLE_ELEMENTS = ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'a', 'p'] as const;

/**
 * Throw unless an assembled partial is static content: the second fence behind
 * {@link escapeJsxText}, which also covers an override that slipped markup in.
 */
function assertStaticPartial(partial: string, context: string): string {
  assertInertMdx(partial, { context, allowedElements: TABLE_ELEMENTS });
  return partial;
}

/** Lowercase every key so overrides match regardless of how they were written. */
export function lowercaseKeys<T>(overrides: Overrides<T>): Overrides<T> {
  return Object.fromEntries(
    Object.entries(overrides).map(([key, value]) => [key.toLowerCase(), value]),
  );
}

/**
 * A declaration with no resolved source line would render a broken `#L0` link. Fail loudly
 * so the writer either fixes the parser or pins an override.
 */
export function assertResolved(
  entries: Record<string, ResolvableEntry>,
  kind: 'method' | 'event',
): void {
  for (const info of Object.values(entries)) {
    if (!info.implementationLine) {
      throw new Error(
        `generate-precompile-tables: no Go reference found for ${kind} ` +
          `"${info.signature ?? info.name}" (interface line ${info.interfaceLine}). ` +
          `Add an override in scripts/data/precompiles-information.ts or update the parser.`,
      );
    }
  }
}

export function renderMethodsInTable(
  interfaceCode: string,
  implementationCode: string,
  interfaceUrl: string,
  implementationUrl: string,
  methodOverrides?: Overrides<MethodOverride>,
): string {
  const methods: Record<string, ParsedMethod> = {};

  // Solidity function signatures may span several lines; concatenate forward until the
  // parameter list closes.
  const interfaceLines = interfaceCode.split('\n');
  for (let i = 0; i < interfaceLines.length; i++) {
    const trimmed = interfaceLines[i].trim();
    if (!trimmed.startsWith('function')) continue;

    let signatureSource = trimmed;
    let j = i;
    while (!signatureSource.includes(')') && j + 1 < interfaceLines.length) {
      j++;
      signatureSource += ' ' + interfaceLines[j].trim();
    }
    const signature =
      signatureSource.split(')')[0].replace('function', '').replace(/\(\s+/, '(').trim() + ')';

    methods[signature.split('(')[0].toLowerCase()] = {
      signature: escapeJsxText(signature),
      interfaceLine: i + 1,
      implementationLine: 0,
      description: '',
    };
  }

  // Pair each Solidity method with the Go func that implements it, by name.
  const implLines = implementationCode.split('\n');
  for (let i = 0; i < implLines.length; i++) {
    const trimmed = implLines[i].trim();
    if (!trimmed.startsWith('func')) continue;
    const afterReceiver = trimmed.split(')')[1];
    if (!afterReceiver) continue; // a plain function, not a method on the precompile
    const methodName = afterReceiver.split('(')[0].trim().toLowerCase();
    if (methods[methodName]) {
      methods[methodName].implementationLine = i + 1;
      methods[methodName].description = escapeJsxText(extractDocComment(implLines, i));
    }
  }

  // The same object, widened: from here on an entry may come from an override alone.
  const entries: Record<string, MethodEntry> = methods;
  if (methodOverrides) {
    for (const [name, override] of Object.entries(lowercaseKeys(methodOverrides))) {
      entries[name] = { ...entries[name], ...override };
    }
  }

  assertResolved(entries, 'method');

  let showDeprecationFlag = false;
  const rows = Object.values(entries)
    .map((method) => {
      if (method.deprecated) showDeprecationFlag = true;
      const description = method.availableSinceArbOS
        ? `${method.description} (Available since ArbOS ${method.availableSinceArbOS})`
        : method.description;

      return `<tr>
            <td>${method.deprecated ? '⚠️' : ''}<code>${method.signature}</code></td>
            <td><a href="${interfaceUrl}#L${method.interfaceLine}" target="_blank">Interface</a></td>
            <td><a href="${implementationUrl}#L${method.implementationLine}" target="_blank">Implementation</a></td>
            <td>${description}</td>
          </tr>`;
    })
    .join('');

  const tableHtml = `<table>
    <thead>
      <tr>
        <th>Method</th>
        <th>Solidity interface</th>
        <th>Go implementation</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;

  return tableHtml + '\n\n' + (showDeprecationFlag ? DEPRECATION_NOTICE : '');
}

export function renderEventsInTable(
  interfaceCode: string,
  implementationCode: string,
  interfaceUrl: string,
  implementationUrl: string,
  eventOverrides?: Overrides<EventOverride>,
): string {
  const events: Record<string, ParsedEvent> = {};

  const interfaceLines = interfaceCode.split('\n');
  for (let i = 0; i < interfaceLines.length; i++) {
    const trimmed = interfaceLines[i].trim();
    if (!trimmed.startsWith('event')) continue;
    const name = trimmed.split('(')[0].replace('event', '').trim();
    events[name.toLowerCase()] = {
      name,
      interfaceLine: i + 1,
      implementationLine: 0,
      description: escapeJsxText(extractDocComment(interfaceLines, i)),
    };
  }

  // Prefer the emit site: `con.<eventName>(`. First match per event wins.
  const implLines = implementationCode.split('\n');
  for (let i = 0; i < implLines.length; i++) {
    const lineLower = implLines[i].toLowerCase();
    for (const key of Object.keys(events)) {
      if (events[key].implementationLine !== 0) continue;
      if (lineLower.includes(`con.${key}(`)) events[key].implementationLine = i + 1;
    }
  }

  // Events that are declared but never emitted (deprecated ones, or those emitted through
  // wrapper code elsewhere) fall back to the first mention of the name, usually the
  // struct-field declaration. Guarantees the link resolves.
  for (const key of Object.keys(events)) {
    if (events[key].implementationLine !== 0) continue;
    for (let i = 0; i < implLines.length; i++) {
      if (implLines[i].includes(events[key].name)) {
        events[key].implementationLine = i + 1;
        break;
      }
    }
  }

  // The same object, widened: from here on an entry may come from an override alone.
  const entries: Record<string, EventEntry> = events;
  if (eventOverrides) {
    for (const [name, override] of Object.entries(lowercaseKeys(eventOverrides))) {
      entries[name] = { ...entries[name], ...override };
    }
  }

  assertResolved(entries, 'event');

  if (Object.keys(entries).length === 0) return '';

  const rows = Object.values(entries)
    .map(
      (event) => `<tr>
              <td><code>${escapeJsxText(event.name ?? '')}</code></td>
              <td><a href="${interfaceUrl}#L${event.interfaceLine}" target="_blank">Interface</a></td>
              <td><a href="${implementationUrl}#L${event.implementationLine}" target="_blank">Implementation</a></td>
              <td>${event.description}</td>
            </tr>`,
    )
    .join('');

  return `<table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Solidity interface</th>
          <th>Go implementation</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

/** Input to {@link renderNodeInterfacePartial}. */
export interface NodeInterfacePartialInput {
  marker: string;
  interfaceCode: string;
  implementationCode: string;
  interfaceUrl: string;
  implementationUrl: string;
  methodOverrides?: Overrides<MethodOverride>;
}

/** Input to {@link renderPrecompilePartial}: the NodeInterface input plus event overrides. */
export interface PrecompilePartialInput extends NodeInterfacePartialInput {
  eventOverrides?: Overrides<EventOverride>;
}

/**
 * Assemble one `_<Precompile>.mdx` partial's body: marker, methods table, events table.
 *
 * Pure: the caller fetches `interfaceCode`/`implementationCode` and passes them in. Mirrors
 * `generatePrecompile` in `scripts/generate-precompile-tables.ts` minus the fetch and the write.
 */
export function renderPrecompilePartial({
  marker,
  interfaceCode,
  implementationCode,
  interfaceUrl,
  implementationUrl,
  methodOverrides,
  eventOverrides,
}: PrecompilePartialInput): string {
  const methodsTable = renderMethodsInTable(
    interfaceCode,
    implementationCode,
    interfaceUrl,
    implementationUrl,
    methodOverrides,
  );
  const eventsTable = renderEventsInTable(
    interfaceCode,
    implementationCode,
    interfaceUrl,
    implementationUrl,
    eventOverrides,
  );

  return assertStaticPartial(`${marker}\n\n${methodsTable}${eventsTable}`, interfaceUrl);
}

/**
 * Assemble `_NodeInterface.mdx`'s body: marker, methods table only (NodeInterface has no
 * events). Mirrors `generateNodeInterface` in `scripts/generate-precompile-tables.ts` minus the
 * fetch and the write.
 */
export function renderNodeInterfacePartial({
  marker,
  interfaceCode,
  implementationCode,
  interfaceUrl,
  implementationUrl,
  methodOverrides,
}: NodeInterfacePartialInput): string {
  const methodsTable = renderMethodsInTable(
    interfaceCode,
    implementationCode,
    interfaceUrl,
    implementationUrl,
    methodOverrides,
  );

  return assertStaticPartial(`${marker}\n\n${methodsTable}`, interfaceUrl);
}
