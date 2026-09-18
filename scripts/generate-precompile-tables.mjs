/**
 * generate-precompile-tables — regenerate content/partials/precompile-tables/*.mdx.
 *
 * Usage:
 *   pnpm precompiles:generate          # write the tables
 *   pnpm precompiles:check             # fail if any table on disk is stale
 *
 * For every precompile in scripts/data/precompiles-information.mjs, fetches the Solidity
 * interface and the Go implementation from the commits pinned in content/vars.json, pairs
 * each method and event with its source line, and emits an HTML table partial.
 *
 * Fetching pinned refs rather than reading a local nitro checkout is deliberate: the
 * emitted line-number links must correspond to an exact `nitroVersionTag`, not to whatever
 * happens to be in a working tree.
 *
 * Ported from arbitrum-docs `scripts/precompile-reference-generator.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';

import {
  nodeInterfaceInformation,
  precompilesInformation,
} from './data/precompiles-information.mjs';
import { isCheckMode, runScript, writeOrCheck } from './lib/generated-partial.mjs';

const OUTPUT_DIR = path.join('content', 'partials', 'precompile-tables');

/**
 * Pins that only this generator consumes. They stay here rather than in content/vars.json
 * because that file is the writer-facing set rendered by `<Var>` — these are never shown
 * to a reader. The shared pins (nitroVersionTag, nitroPrecompilesCommit, …) do live in
 * vars.json and are read from it below, so no value is duplicated across the two.
 */
const NODE_INTERFACE_PINS = {
  nitroContractsRepositorySlug: 'nitro-contracts',
  nitroContractsCommit: '4341b132cfbdcc980ead03765ca5224ff6cb5d97',
  nitroContractsPathToPrecompilesInterface: 'src/node-interface',
  nitroPrecompilesPathToInterfaces: '',
};

const vars = JSON.parse(fs.readFileSync(path.join('content', 'vars.json'), 'utf-8'));

const interfacePath = NODE_INTERFACE_PINS.nitroPrecompilesPathToInterfaces
  ? `/${NODE_INTERFACE_PINS.nitroPrecompilesPathToInterfaces}`
  : '';
const interfaceBaseUrl = `https://github.com/OffchainLabs/${vars.nitroPrecompilesRepositorySlug}/blob/${vars.nitroPrecompilesCommit}${interfacePath}/`;
const implementationBaseUrl = `https://github.com/OffchainLabs/${vars.nitroRepositorySlug}/blob/${vars.nitroVersionTag}/${vars.nitroPathToPrecompiles}/`;
const nodeInterfaceInterfaceBaseUrl = `https://github.com/OffchainLabs/${NODE_INTERFACE_PINS.nitroContractsRepositorySlug}/blob/${NODE_INTERFACE_PINS.nitroContractsCommit}/${NODE_INTERFACE_PINS.nitroContractsPathToPrecompilesInterface}/`;
const nodeInterfaceImplementationBaseUrl = `https://github.com/OffchainLabs/${vars.nitroRepositorySlug}/blob/${vars.nitroVersionTag}/execution/nodeinterface/`;

const DEPRECATION_NOTICE =
  '<p>Note: methods marked with ⚠️ are deprecated and their use is not supported.</p>';

/**
 * Prettier options for the generated `.mdx` partials.
 *
 * These files are the one place MDX gets Prettier-formatted in this repo: `.prettierignore`
 * excludes `**\/*.mdx` from `pnpm format`, so nothing else touches them and the generator
 * owns their shape (the same arrangement the ignore file documents for CATALOG.md).
 *
 * `printWidth: 9999` keeps each `<a>` tag's attributes on one line, which is what the
 * committed tables already look like — so regenerating produces no formatting churn. The
 * `*`-escaping hazard that motivates the repo-wide MDX exclusion cannot apply here: these
 * partials are HTML tables and never contain `{/* … *\/}` expression comments.
 */
const MDX_FORMAT = { parser: 'mdx', printWidth: 9999, proseWrap: 'preserve', plugins: [] };

/** GitHub blob URL → raw URL for the same ref. */
const toRawUrl = (url) =>
  url.replace('github.com', 'raw.githubusercontent.com').replace('blob/', '');

async function fetchSource(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed fetching ${label} with status ${response.status}: ${url}`);
  }
  return response.text();
}

/**
 * Join the consecutive `//` comment lines immediately above `lineIdx` into one
 * description. Handles multi-line doc comments in both Go and Solidity. Returns '' when
 * no comment directly precedes the declaration.
 */
function extractDocComment(lines, lineIdx) {
  const commentLines = [];
  for (let j = lineIdx - 1; j >= 0; j--) {
    const trimmed = lines[j].trim();
    if (!trimmed.startsWith('//')) break;
    commentLines.unshift(trimmed.replace(/^\/\/+\s*/, ''));
  }
  return commentLines.join(' ').trim();
}

/** Lowercase every key so overrides match regardless of how they were written. */
function lowercaseKeys(overrides) {
  return Object.fromEntries(
    Object.entries(overrides).map(([key, value]) => [key.toLowerCase(), value]),
  );
}

/**
 * A declaration with no resolved source line would render a broken `#L0` link. Fail loudly
 * so the writer either fixes the parser or pins an override.
 */
function assertResolved(entries, kind) {
  for (const info of Object.values(entries)) {
    if (!info.implementationLine) {
      throw new Error(
        `generate-precompile-tables: no Go reference found for ${kind} ` +
          `"${info.signature ?? info.name}" (interface line ${info.interfaceLine}). ` +
          `Add an override in scripts/data/precompiles-information.mjs or update the parser.`,
      );
    }
  }
}

function renderMethodsInTable(
  interfaceCode,
  implementationCode,
  interfaceUrl,
  implementationUrl,
  methodOverrides,
) {
  const methods = {};

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
      signature,
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
      methods[methodName].description = extractDocComment(implLines, i);
    }
  }

  if (methodOverrides) {
    for (const [name, override] of Object.entries(lowercaseKeys(methodOverrides))) {
      methods[name] = { ...methods[name], ...override };
    }
  }

  assertResolved(methods, 'method');

  let showDeprecationFlag = false;
  const rows = Object.values(methods)
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

function renderEventsInTable(
  interfaceCode,
  implementationCode,
  interfaceUrl,
  implementationUrl,
  eventOverrides,
) {
  const events = {};

  const interfaceLines = interfaceCode.split('\n');
  for (let i = 0; i < interfaceLines.length; i++) {
    const trimmed = interfaceLines[i].trim();
    if (!trimmed.startsWith('event')) continue;
    const name = trimmed.split('(')[0].replace('event', '').trim();
    events[name.toLowerCase()] = {
      name,
      interfaceLine: i + 1,
      implementationLine: 0,
      description: extractDocComment(interfaceLines, i),
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
  // wrapper code elsewhere) fall back to the first mention of the name — usually the
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

  if (eventOverrides) {
    for (const [name, override] of Object.entries(lowercaseKeys(eventOverrides))) {
      events[name] = { ...events[name], ...override };
    }
  }

  assertResolved(events, 'event');

  if (Object.keys(events).length === 0) return '';

  const rows = Object.values(events)
    .map(
      (event) => `<tr>
              <td><code>${event.name}</code></td>
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

async function generatePrecompile(name, check, methodOverrides, eventOverrides) {
  const interfaceUrl = `${interfaceBaseUrl}${name}.sol`;
  const implementationUrl = `${implementationBaseUrl}${name}.go`;

  const interfaceCode = await fetchSource(toRawUrl(interfaceUrl), `${name} interface`);
  const implementationCode = await fetchSource(
    toRawUrl(implementationUrl),
    `${name} implementation`,
  );

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

  await writeOrCheck(path.join(OUTPUT_DIR, `_${name}.mdx`), methodsTable + eventsTable, {
    check,
    overrides: MDX_FORMAT,
  });
}

async function generateNodeInterface(check, methodOverrides) {
  const interfaceUrl = `${nodeInterfaceInterfaceBaseUrl}NodeInterface.sol`;
  const implementationUrl = `${nodeInterfaceImplementationBaseUrl}node_interface.go`;

  const interfaceCode = await fetchSource(toRawUrl(interfaceUrl), 'NodeInterface interface');
  const implementationCode = await fetchSource(
    toRawUrl(implementationUrl),
    'NodeInterface implementation',
  );

  const methodsTable = renderMethodsInTable(
    interfaceCode,
    implementationCode,
    interfaceUrl,
    implementationUrl,
    methodOverrides,
  );

  await writeOrCheck(path.join(OUTPUT_DIR, '_NodeInterface.mdx'), methodsTable, {
    check,
    overrides: MDX_FORMAT,
  });
}

async function main() {
  const check = isCheckMode();

  await Promise.all(
    Object.entries(precompilesInformation).map(([name, { methodOverrides, eventOverrides }]) =>
      generatePrecompile(name, check, methodOverrides, eventOverrides),
    ),
  );
  await generateNodeInterface(check, nodeInterfaceInformation.methodOverrides);

  console.log(
    check
      ? 'precompile tables: up to date.'
      : `precompile tables: generated ${Object.keys(precompilesInformation).length + 1} partial(s).`,
  );
}

runScript(main);
