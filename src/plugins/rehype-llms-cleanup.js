const { buildMarkerValue } = require('./llms-markers');
const h = require('hastscript');
// hast-util-select is ESM; Node 22.x supports require() of ESM modules that
// don't use top-level await, which this package doesn't. Loads synchronously.
const { matches, select, selectAll } = require('hast-util-select');

// Post-order walk. Visitor returns: null to drop the node, an array to splice
// many in its place, a single node to replace it, or undefined to keep.
function walk(node, visit, parent = null) {
  if (Array.isArray(node.children)) {
    const out = [];
    for (const child of node.children) {
      const result = walk(child, visit, node);
      if (result === null) continue;
      if (Array.isArray(result)) out.push(...result);
      else out.push(result !== undefined ? result : child);
    }
    node.children = out;
  }
  return visit(node, parent);
}

function getTextContent(nodes) {
  let s = '';
  for (const n of nodes) {
    if (n.type === 'text') s += n.value;
    else if (Array.isArray(n.children)) s += getTextContent(n.children);
  }
  return s;
}

function getAdmonitionType(node) {
  if (!matches('div.theme-admonition', node)) return null;
  const prefix = 'theme-admonition-';
  const typeClass = node.properties.className.find((c) => c.startsWith(prefix));
  return typeClass ? typeClass.slice(prefix.length) : null;
}

function admonitionToBlockquote(node, type) {
  // Docusaurus uses hashed class names like admonitionHeading_Gvgb, so we
  // match by substring on the class attribute.
  const heading = select('[class*="admonitionHeading"]', node);
  const content = select('[class*="admonitionContent"]', node);
  const titleChildren = heading
    ? (heading.children || []).filter((c) => !matches('[class*="admonitionIcon"]', c))
    : [];
  const typeLabel = type.toUpperCase();
  const titleText = getTextContent(titleChildren).trim();
  const isDefaultTitle = titleText.toLowerCase() === type.toLowerCase();
  const firstParaChildren = [h('strong', typeLabel)];
  if (!isDefaultTitle && titleChildren.length > 0) {
    firstParaChildren.push(' — ', ...titleChildren);
  }
  return h('blockquote', [h('p', firstParaChildren), ...((content && content.children) || [])]);
}

function propagateCodeLanguage(node) {
  if (!matches('pre[class*="language-"]', node)) return;
  const langClass = node.properties.className.find((c) => /^language-/.test(c));
  const code = (node.children || []).find((c) => c.type === 'element' && c.tagName === 'code');
  if (!code) return;
  const existing = Array.isArray(code.properties?.className) ? code.properties.className : [];
  if (existing.includes(langClass)) return;
  code.properties = code.properties || {};
  code.properties.className = [...existing, langClass];
}

// Carry markers across the hast→mdast boundary as <code> (inline) or
// <pre><code> (block) elements rather than hast comments. Comments are
// treated as skippable by rehype-minify-whitespace and would swallow
// adjacent text whitespace (e.g. "Where $U$ is" becomes "Where $U$is").
function mkInlineMarker(kind, payload) {
  return h('code.llms-marker', buildMarkerValue(kind, payload));
}

function mkBlockMarker(kind, payload) {
  return h('pre.llms-marker', h('code', buildMarkerValue(kind, payload)));
}

function tabsToMarkers(node) {
  const tablist = select('[role="tablist"]', node);
  if (!tablist) return null;
  const labels = (tablist.children || []).filter((c) => matches('[role="tab"]', c));
  const panels = selectAll('[role="tabpanel"]', node);
  if (labels.length === 0 || panels.length === 0) return null;
  const count = Math.min(labels.length, panels.length);
  return labels
    .slice(0, count)
    .flatMap((label, i) => [
      mkBlockMarker('DETAILS_OPEN', getTextContent(label.children || []).trim()),
      ...(panels[i].children || []),
      mkBlockMarker('DETAILS_CLOSE', ''),
    ]);
}

function getAnnotationLatex(node) {
  const annotation = select('annotation[encoding="application/x-tex"]', node);
  if (!annotation) return null;
  return getTextContent(annotation.children || []);
}

module.exports = function rehypeLlmsCleanup() {
  return (tree) => {
    walk(tree, (node, parent) => {
      if (matches('a.hash-link', node)) return null;
      if (matches('a[data-quicklook-from]', node)) return node.children || [];
      const adm = getAdmonitionType(node);
      if (adm) return admonitionToBlockquote(node, adm);
      if (matches('.tabs-container, .theme-tabs-container', node)) {
        const replacement = tabsToMarkers(node);
        if (replacement) return replacement;
      }
      if (matches('span.katex-display', node)) {
        const latex = getAnnotationLatex(node);
        if (latex != null) return mkBlockMarker('MATH_BLOCK', latex);
      } else if (matches('span.katex', node)) {
        // Skip when wrapped in <span class="katex-display"> — the outer span
        // is visited next (post-order) and will emit the block-math marker.
        if (parent && matches('span.katex-display', parent)) return;
        const latex = getAnnotationLatex(node);
        if (latex != null) return mkInlineMarker('MATH_INLINE', latex);
      }
      propagateCodeLanguage(node);
    });
  };
};
