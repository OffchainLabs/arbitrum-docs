import globalVars from '../resources/globalVars.js';
import precompilesInformation from '../resources/precompilesInformation.js';
import fs from 'fs';

type PrecompileMethodInfo = {
  signature: string;
  interfaceLine: number;
  implementationLine: number;
  description: string;
  deprecated?: boolean;
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

const partialTablesBasePath = '../arbitrum-docs/arbos/_partials/precompile-tables';
const interfaceBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroContractsRepositorySlug}/blob/${globalVars.nitroContractsCommit}/${globalVars.nitroContractsPathToPrecompilesInterface}/`;
const implementationBaseUrl = `https://github.com/OffchainLabs/${globalVars.nitroRepositorySlug}/blob/${globalVars.nitroVersionTag}/${globalVars.nitroPathToPrecompiles}/`;
const defaultDeprecationNotice = `<p>Note: methods marked with ⚠️ are deprecated and their use is not supported.</p>`;

const renderMethodsInTable = (
  interfaceCode: string,
  implementationCode: string,
  precompileName: string,
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
    // Merge potential overrides
    Object.keys(methodOverrides).map((methodName: string) => {
      methodsInformation[methodName] = {
        ...methodsInformation[methodName],
        ...methodOverrides[methodName],
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

          return `<tr>
            <td>${methodInfo.deprecated ? `⚠️` : ''}<code>${methodInfo.signature}</code></td>
            <td><a href="${interfaceBaseUrl}${precompileName}.sol#L${
            methodInfo.interfaceLine
          }" target="_blank">Interface</a></td>
            <td><a href="${implementationBaseUrl}${precompileName}.go#L${
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
  precompileName: string,
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
              <td><a href="${interfaceBaseUrl}${precompileName}.sol#L${eventInfo.interfaceLine}" target="_blank">Interface</a></td>
              <td><a href="${implementationBaseUrl}${precompileName}.go#L${eventInfo.implementationLine}" target="_blank">Implementation</a></td>
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
    precompileName,
    methodOverrides,
  );
  const eventsTable = renderEventsInTable(
    interfaceCode,
    implementationCode,
    precompileName,
    eventOverrides,
  );

  fs.writeFileSync(`${partialTablesBasePath}/${precompileName}.md`, methodsTable + eventsTable);
};

const main = async (precompilesInformation) => {
  await Promise.all(
    Object.keys(precompilesInformation).map(async (precompileName) => {
      const methodOverrides = precompilesInformation[precompileName].methodOverrides ?? undefined;
      const eventOverrides = precompilesInformation[precompileName].eventOverrides ?? undefined;
      await generatePrecompileReferenceTables(precompileName, methodOverrides, eventOverrides);
    }),
  );
};

main(precompilesInformation)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
