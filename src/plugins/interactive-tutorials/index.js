const fs = require('fs');
const path = require('path');

const fencePattern = /```(\w+)?([^\n`]*)\n([\s\S]*?)```/g;
const validMarkerPattern =
  /^\s*(?:(?:\/\/|#)\s*walkthrough-step\s+([\w-]+)\s+"([^"]+)"|<!--\s*walkthrough-step\s+([\w-]+)\s+"([^"]+)"\s*-->)\s*$/;

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(fullPath);
    return /\.(md|mdx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function validateWalkthroughFence(filePath, fenceBody) {
  const ids = new Set();
  let markerCount = 0;

  fenceBody.split('\n').forEach((line, index) => {
    if (!line.includes('walkthrough-step')) return;

    const marker = line.match(validMarkerPattern);
    if (!marker) {
      throw new Error(`${filePath}:${index + 1} has a malformed walkthrough-step marker`);
    }

    const id = marker[1] || marker[3];
    if (ids.has(id)) {
      throw new Error(`${filePath}:${index + 1} repeats walkthrough-step id "${id}"`);
    }

    ids.add(id);
    markerCount += 1;
  });

  if (markerCount === 0) {
    throw new Error(`${filePath} has a walkthrough code fence with no walkthrough-step markers`);
  }
}

module.exports = function interactiveTutorialsPlugin(context) {
  return {
    name: 'interactive-tutorials',
    async loadContent() {
      const docsDir = path.join(context.siteDir, 'docs');
      const files = listMarkdownFiles(docsDir);

      files.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        while ((match = fencePattern.exec(content)) !== null) {
          const meta = match[2] || '';
          if (/(^|\s)walkthrough(\s|$)/.test(meta)) {
            validateWalkthroughFence(path.relative(context.siteDir, filePath), match[3]);
          }
        }
      });
    },
    configureWebpack() {
      return {
        resolve: {
          fallback: {
            fs: false,
            path: false,
          },
        },
      };
    },
  };
};
