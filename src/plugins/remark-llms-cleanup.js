const { MARKER_RE } = require('./llms-markers');

const EMPTY_COMMENT = /^<!--\s*-->$/;

function rewriteMarkerValue(value) {
  const m = MARKER_RE.exec(value);
  if (!m) return null;
  const kind = m[1];
  const payload = decodeURIComponent(m[2]);
  if (kind === 'DETAILS_OPEN') return `<details>\n<summary>${escapeHtml(payload)}</summary>\n`;
  if (kind === 'DETAILS_CLOSE') return `\n</details>`;
  if (kind === 'MATH_INLINE') return `$${payload}$`;
  if (kind === 'MATH_BLOCK') return `\n$$\n${payload}\n$$\n`;
  return null;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Post-order walk. Visitor returns null to drop the node, or undefined to keep
// (with whatever mutations were applied in place).
function walk(node, visit) {
  if (Array.isArray(node.children)) {
    const out = [];
    for (const child of node.children) {
      const result = walk(child, visit);
      if (result === null) continue;
      out.push(result !== undefined ? result : child);
    }
    node.children = out;
  }
  return visit(node);
}

module.exports = function remarkLlmsCleanup() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type === 'inlineCode' || node.type === 'code') {
        const html = rewriteMarkerValue(node.value);
        if (html !== null) {
          node.type = 'html';
          node.value = html;
          delete node.lang;
          delete node.meta;
          return;
        }
      }
      if (
        node.type === 'html' &&
        typeof node.value === 'string' &&
        EMPTY_COMMENT.test(node.value)
      ) {
        return null;
      }
    });
  };
};
