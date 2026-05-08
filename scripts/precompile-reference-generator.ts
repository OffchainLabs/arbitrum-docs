import globalVars from '../src/resources/globalVars.js';
import {
  precompilesInformation,
  nodeInterfaceInformation,
} from '../src/resources/precompilesInformation.js';
import fs from 'fs';

type PrecompileMethodInfo = {
  signature: string;
  interfaceLine: number;
  implementationLine: number;
  description: string;
  deprecated?: boolean;
  availableSinceArbOS?: number;
};

type PrecompileEventInfo = {
  name: string;
  interfaceLine: number;
  implementationLine: number;
  description: string;
};

type PrecompileMethodOverrides = {
  [key: string]: PrecompileMethodInfo;
};

type PrecompileEventOverrides = {
  [key: string]: PrecompileEventInfo;
};

// Walks backward from `lineIdx` over consecutive `// ...` comment lines and joins
// them into a single description. Handles Go-style multi-line doc comments above
// a func/event/struct-field declaration. Returns '' if no comment immediately precedes.
const extractDocComment = (lines: string[], lineIdx: number): string => {
  const commentLines: string[] = [];
  for (let j = lineIdx - 1; j >= 0; j--) {
    const t = lines[j].trim();
    if (!t.startsWith('//')) break;
    commentLines.unshift(t.replace(/^\/\/\s?/, ''));
  }
  return commentLines.join(' ').trim();
};

const partialTablesBasePath = './docs/for-devs/dev-tools-and-resources/partials/precompile-tables';
// Precompile interfaces are in the nitro-precompile-interfaces repository
const interfaceBaseUrl = `https://github.com/OffchainLabs/${
  globalVars.nitroPrecompilesRepositorySlug
}/blob/${globalVars.nitroPrecompilesCommit}${
  globalVars.nitroPrecompilesPathToInterfaces
    ? '/' + globalVars.nitroPrecompilesPathToInterfaces
    : ''
}/`;
const implementationBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroRepositorySlug}/blob/${globalVars.nitroVersionTag}/${globalVars.nitroPathToPrecompiles}/`;
// NodeInterface is in the nitro-contracts repository
const nodeInterfaceInterfaceBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroContractsRepositorySlug}/blob/${globalVars.nitroContractsCommit}/${globalVars.nitroContractsPathToPrecompilesInterface}/`;
const nodeInterfaceImplementationBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroRepositorySlug}/blob/${globalVars.nitroVersionTag}/execution/nodeInterface/`;
const defaultDeprecationNotice = `<p>Note: methods marked with ⚠️ are deprecated and their use is not supported.</p>`;

const renderMethodsInTable = (
  interfaceCode: string,
  implementationCode: string,
  interfaceUrl: string,
  implementationUrl: string,
  methodOverrides?: PrecompileMethodOverrides,
) => {
  // Initialization of list of methods
  const methodsInformation: { [key: string]: PrecompileMethodInfo } = {};

  // Detect all method signatures in the interface
  const interfaceLines = interfaceCode.split('\n');
  for (let i = 0; i < interfaceLines.length; i++) {
    const trimmedLine = interfaceLines[i].trim();
    if (trimmedLine.startsWith('function')) {
      const signature = trimmedLine.split(')')[0].replace('function', '').trim() + ')';
      const methodName = signature.split('(')[0].toLowerCase();
      methodsInformation[methodName] = {
        signature,
        interfaceLine: i + 1,
        implementationLine: 0,
        description: '',
      };
    }
  }

  // Get information about the implementation of methods.
  // The Go doc comment may span multiple lines, so we walk backward from the func
  // line and concatenate all consecutive `//` lines (Fix A).
  const implLines = implementationCode.split('\n');
  for (let i = 0; i < implLines.length; i++) {
    const trimmedLine = implLines[i].trim();
    if (!trimmedLine.startsWith('func')) continue;
    const afterReceiver = trimmedLine.split(')')[1];
    if (!afterReceiver) continue; // not a method (no receiver)
    const methodName = afterReceiver.split('(')[0].trim().toLowerCase();
    if (methodsInformation[methodName]) {
      methodsInformation[methodName].implementationLine = i + 1;
      methodsInformation[methodName].description = extractDocComment(implLines, i);
    }
  }

  if (methodOverrides) {
    // Making all method names lowercase
    const lowercasedMethodOverrides = Object.keys(methodOverrides).reduce((acc, key) => {
      acc[key.toLowerCase()] = methodOverrides[key];
      return acc;
    }, {});

    // Merge potential overrides
    Object.keys(lowercasedMethodOverrides).map((methodName: string) => {
      methodsInformation[methodName] = {
        ...methodsInformation[methodName],
        ...lowercasedMethodOverrides[methodName],
      };
    });
  }

  // Guard rail (Fix C): a Solidity method without a matched Go function would
  // produce a broken `#L0` GitHub link. Fail loudly so the writer knows to
  // either fix the parser or pin a methodOverrides entry in
  // src/resources/precompilesInformation.js.
  for (const info of Object.values(methodsInformation)) {
    if (!info.implementationLine) {
      throw new Error(
        `precompile-reference-generator: no Go implementation found for method ` +
          `"${info.signature}" (interface line ${info.interfaceLine}). ` +
          `Add a methodOverrides entry in src/resources/precompilesInformation.js ` +
          `or update the parser.`,
      );
    }
  }

  // Deprecation flag
  let showDeprecationFlag = false;

  // Create HTML
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
      ${Object.values(methodsInformation)
        .map((methodInfo: PrecompileMethodInfo) => {
          if (methodInfo.deprecated) {
            showDeprecationFlag = true;
          }
          if (methodInfo.availableSinceArbOS) {
            methodInfo.description += ` (Available since ArbOS ${methodInfo.availableSinceArbOS})`;
          }

          return `<tr>
            <td>${methodInfo.deprecated ? `⚠️` : ''}<code>${methodInfo.signature}</code></td>
            <td><a href="${interfaceUrl}#L${
            methodInfo.interfaceLine
          }" target="_blank">Interface</a></td>
            <td><a href="${implementationUrl}#L${
            methodInfo.implementationLine
          }" target="_blank">Implementation</a></td>
            <td>${methodInfo.description}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>`;

  const deprecationNotice = showDeprecationFlag ? defaultDeprecationNotice : '';

  return tableHtml + '\n\n' + deprecationNotice;
};

const renderEventsInTable = (
  interfaceCode: string,
  implementationCode: string,
  interfaceUrl: string,
  implementationUrl: string,
  eventOverrides?: PrecompileEventOverrides,
) => {
  // Initialization of list of events
  const eventsInformation: { [key: string]: PrecompileEventInfo } = {};

  // Detect all event names in the interface. Solidity doc comments may span
  // multiple lines, so use the same backward-scan helper as for Go (Fix A).
  const interfaceLines = interfaceCode.split('\n');
  for (let i = 0; i < interfaceLines.length; i++) {
    const trimmedLine = interfaceLines[i].trim();
    if (trimmedLine.startsWith('event')) {
      const eventName = trimmedLine.split('(')[0].replace('event', '').trim();
      eventsInformation[eventName.toLowerCase()] = {
        name: eventName,
        interfaceLine: i + 1,
        implementationLine: 0,
        description: extractDocComment(interfaceLines, i),
      };
    }
  }

  // Find emit sites in the Go file: pattern `con.<eventname>(`. Take the FIRST
  // match per event; deprecated events that are declared but never emitted will
  // remain at 0 here and get filled in by the fallback below.
  const implLines = implementationCode.split('\n');
  for (let i = 0; i < implLines.length; i++) {
    const lineLower = implLines[i].toLowerCase();
    Object.keys(eventsInformation).forEach((eventKey) => {
      if (eventsInformation[eventKey].implementationLine !== 0) return;
      if (lineLower.includes(`con.${eventKey}(`)) {
        eventsInformation[eventKey].implementationLine = i + 1;
      }
    });
  }

  // Fallback (Fix B): for events without an emit site (deprecated events that
  // are only declared, or events emitted via wrapper/framework code outside this
  // file), point the link at the FIRST occurrence of the event name in the Go
  // source — typically its struct-field declaration. Guarantees a working link.
  for (const eventKey of Object.keys(eventsInformation)) {
    const info = eventsInformation[eventKey];
    if (info.implementationLine !== 0) continue;
    for (let i = 0; i < implLines.length; i++) {
      if (implLines[i].includes(info.name)) {
        eventsInformation[eventKey].implementationLine = i + 1;
        break;
      }
    }
  }

  if (eventOverrides) {
    // Merge potential overrides
    Object.keys(eventOverrides).map((eventName: string) => {
      eventsInformation[eventName] = {
        ...eventsInformation[eventName],
        ...eventOverrides[eventName],
      };
    });
  }

  // Guard rail (Fix C): refuse to emit `#L0` links. If we get here with an
  // unresolved event, neither the emit-site search nor the struct-field fallback
  // found anything in the Go source — the writer needs to add an eventOverrides
  // entry or fix the parser.
  for (const info of Object.values(eventsInformation)) {
    if (!info.implementationLine) {
      throw new Error(
        `precompile-reference-generator: no Go reference found for event ` +
          `"${info.name}" (interface line ${info.interfaceLine}). ` +
          `Add an eventOverrides entry in src/resources/precompilesInformation.js ` +
          `or update the parser.`,
      );
    }
  }

  // Create HTML
  if (Object.keys(eventsInformation).length > 0) {
    const tableHtml = `<table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Solidity interface</th>
          <th>Go implementation</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${Object.values(eventsInformation)
          .map((eventInfo: PrecompileEventInfo) => {
            return `<tr>
              <td><code>${eventInfo.name}</code></td>
              <td><a href="${interfaceUrl}#L${eventInfo.interfaceLine}" target="_blank">Interface</a></td>
              <td><a href="${implementationUrl}#L${eventInfo.implementationLine}" target="_blank">Implementation</a></td>
              <td>${eventInfo.description}</td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>`;

    return tableHtml;
  } else {
    return '';
  }
};

const generatePrecompileReferenceTables = async (
  precompileName: string,
  methodOverrides?: PrecompileMethodOverrides,
  eventOverrides?: PrecompileEventOverrides,
) => {
  const interfaceCodeRawResponse = await fetch(
    `${interfaceBaseUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('blob/', '')}${precompileName}.sol`,
  );
  if (!interfaceCodeRawResponse.ok) {
    throw new Error(
      `Failed fetching precompile ${precompileName} interface with status ${interfaceCodeRawResponse.status}`,
    );
  }

  const interfaceCode = await interfaceCodeRawResponse.text();
  const implementationCodeRawResponse = await fetch(
    `${implementationBaseUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('blob/', '')}${precompileName}.go`,
  );
  if (!implementationCodeRawResponse.ok) {
    throw new Error(
      `Failed fetching precompile ${precompileName} implementation with status ${implementationCodeRawResponse.status}`,
    );
  }
  const implementationCode = await implementationCodeRawResponse.text();

  const methodsTable = renderMethodsInTable(
    interfaceCode,
    implementationCode,
    interfaceBaseUrl + precompileName + '.sol',
    implementationBaseUrl + precompileName + '.go',
    methodOverrides,
  );
  const eventsTable = renderEventsInTable(
    interfaceCode,
    implementationCode,
    interfaceBaseUrl + precompileName + '.sol',
    implementationBaseUrl + precompileName + '.go',
    eventOverrides,
  );

  fs.writeFileSync(`${partialTablesBasePath}/_${precompileName}.mdx`, methodsTable + eventsTable);
};

const generateNodeInterfaceReferenceTables = async (
  methodOverrides?: PrecompileMethodOverrides,
) => {
  const interfaceCodeRawResponse = await fetch(
    `${nodeInterfaceInterfaceBaseUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('blob/', '')}NodeInterface.sol`,
  );
  const interfaceCode = await interfaceCodeRawResponse.text();
  const implementationCodeRawResponse = await fetch(
    `${nodeInterfaceImplementationBaseUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('blob/', '')}NodeInterface.go`,
  );
  const implementationCode = await implementationCodeRawResponse.text();

  const methodsTable = renderMethodsInTable(
    interfaceCode,
    implementationCode,
    nodeInterfaceInterfaceBaseUrl + 'NodeInterface.sol',
    nodeInterfaceImplementationBaseUrl + 'NodeInterface.go',
    methodOverrides,
  );

  fs.writeFileSync(`${partialTablesBasePath}/_NodeInterface.mdx`, methodsTable);
};

const main = async (precompilesInformation, nodeInterfaceInformation) => {
  await Promise.all(
    Object.keys(precompilesInformation).map(async (precompileName) => {
      const methodOverrides = precompilesInformation[precompileName].methodOverrides ?? undefined;
      const eventOverrides = precompilesInformation[precompileName].eventOverrides ?? undefined;
      await generatePrecompileReferenceTables(precompileName, methodOverrides, eventOverrides);
    }),
  );
  await generateNodeInterfaceReferenceTables(nodeInterfaceInformation.methodOverrides ?? undefined);
};

main(precompilesInformation, nodeInterfaceInformation)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
