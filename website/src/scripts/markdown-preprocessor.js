const globalVars = require('../resources/globalVars.js');

function preprocessContent({ filePath, fileContent }) {
  if (!filePath.endsWith('.mdx')) return fileContent;

  return fileContent.replace(
    /@@\s*([a-zA-Z0-9_-]+)=([^@]+)@@/g,
    (match, varName, value) => globalVars[varName] || value.trim(),
  );
}

module.exports = preprocessContent;
