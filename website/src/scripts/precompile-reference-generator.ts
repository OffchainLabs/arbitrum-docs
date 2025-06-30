import globalVars from '../resources/globalVars.js';
import {
  precompilesInformation,
  nodeInterfaceInformation,
} from '../resources/precompilesInformation.js';
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

const partialTablesBasePath =
  '../arbitrum-docs/for-devs/dev-tools-and-resources/partials/precompile-tables';
const interfaceBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroPrecompilesRepositorySlug}/blob/main`;
const implementationBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroRepositorySlug}/blob/${globalVars.nitroVersionTag}/${globalVars.nitroPathToPrecompiles}/`;
const nodeInterfaceInterfaceBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroContractsRepositorySlug}/blob/${globalVars.nitroContractsCommit}/src/node-interface/`;
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
  let interfaceLineNumber = 0;
  interfaceCode.split('\n').forEach((line) => {
    interfaceLineNumber++;

    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('function')) {
      const signature = trimmedLine.split(')')[0].replace('function', '').trim() + ')';
      const methodName = signature.split('(')[0].toLowerCase();
      const methodInfo: PrecompileMethodInfo = {
        signature,
        interfaceLine: interfaceLineNumber,
        implementationLine: 0,
        description: '',
      };

      methodsInformation[methodName] = methodInfo;
    }
  });

  // Get information about the implementation of methods
  let implementationLineNumber = 0;
  let previousLine = '';
  implementationCode.split('\n').forEach((line) => {
    implementationLineNumber++;

    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('func')) {
      const methodName = trimmedLine.split(')')[1].split('(')[0].trim().toLowerCase();
      const methodDescription = previousLine.trim().startsWith('//')
        ? previousLine.split('//')[1].trim()
        : '';

      if (methodsInformation[methodName]) {
        methodsInformation[methodName].implementationLine = implementationLineNumber;
        methodsInformation[methodName].description = methodDescription;
      }
    }

    previousLine = line;
  });

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

  return tableHtml + deprecationNotice;
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

  // Detect all event names in the interface
  let interfaceLineNumber = 0;
  let previousLine = '';
  interfaceCode.split('\n').forEach((line) => {
    interfaceLineNumber++;

    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('event')) {
      const eventName = trimmedLine.split('(')[0].replace('event', '').trim();
      const eventDescription = previousLine.trim().startsWith('//')
        ? previousLine.split('//')[1].trim()
        : '';
      const eventInfo: PrecompileEventInfo = {
        name: eventName,
        interfaceLine: interfaceLineNumber,
        implementationLine: 0,
        description: eventDescription,
      };

      eventsInformation[eventName.toLowerCase()] = eventInfo;
    }

    previousLine = line;
  });

  // Get information about where the events are emitted
  let implementationLineNumber = 0;
  implementationCode.split('\n').forEach((line) => {
    implementationLineNumber++;
    Object.keys(eventsInformation).map((eventName) => {
      if (line.toLowerCase().includes(`con.${eventName}(`)) {
        eventsInformation[eventName].implementationLine = implementationLineNumber;
      }
    });
  });

  if (eventOverrides) {
    // Merge potential overrides
    Object.keys(eventOverrides).map((eventName: string) => {
      eventsInformation[eventName] = {
        ...eventsInformation[eventName],
        ...eventOverrides[eventName],
      };
    });
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
  const interfaceCode = await interfaceCodeRawResponse.text();
  const implementationCodeRawResponse = await fetch(
    `${implementationBaseUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('blob/', '')}${precompileName}.go`,
  );
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
