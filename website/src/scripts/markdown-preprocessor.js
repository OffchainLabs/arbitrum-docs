const globalVars = require('../resources/globalVars.js');

/**
 * This preprocessor uses globalVars as the source of truth to work around Vercel's caching behavior.
 *
 * NOTE ABOUT DUPLICATION:
 * Variables are stored in two places:
 * 1. In MD/MDX files: @@variable=value@@
 * 2. In globalVars.js
 *
 * While this seems like duplication, it's necessary because:
 * - Vercel caches pages that haven't been modified
 * - Changes to globalVars.js alone won't trigger a rebuild of cached pages
 * - By updating the MD/MDX files directly when globalVars change, we force Vercel to rebuild
 */
function preprocessContent({ filePath, fileContent }) {
  if (!filePath.endsWith('.mdx') && !filePath.endsWith('.md')) return fileContent;

  return fileContent.replace(
    /@@\s*([a-zA-Z0-9_-]+)=[^@]+@@/g,
    (match, varName) => `@@${varName}=${globalVars[varName] || ''}@@`,
  );
}

module.exports = preprocessContent;
