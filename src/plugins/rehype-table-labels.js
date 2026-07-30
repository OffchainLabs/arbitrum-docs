// Injects a `data-label` on every body cell of a markdown table, naming its
// column, and tags tables wider than two columns with `stacked-table`. Together
// these let src/css/partials/_tables.scss render wide tables as labelled cards
// on phones (each row a card, each cell a `label: value` line) instead of
// forcing horizontal scroll.
//
// This handles pipe tables authored in markdown, which reach the rehype stage
// as real hast <table> elements. Raw <table> markup written directly in MDX —
// the generated precompile reference tables — is JSX by the time it gets here,
// not hast, so it never matches; those tables are emitted with the same
// attributes by scripts/precompile-reference-generator.ts instead.

const CELL_TAGS = new Set(['th', 'td']);

// Depth-first collector for element nodes of a given tag name.
function collect(node, tagName, out = []) {
  if (!node || !Array.isArray(node.children)) return out;
  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === tagName) out.push(child);
    collect(child, tagName, out);
  }
  return out;
}

function textOf(node) {
  if (node.type === 'text') return node.value || '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(textOf).join('');
}

function cellsOf(row) {
  return row.children.filter((c) => c.type === 'element' && CELL_TAGS.has(c.tagName));
}

function addClass(node, className) {
  node.properties = node.properties || {};
  const existing = node.properties.className;
  if (Array.isArray(existing)) existing.push(className);
  else if (typeof existing === 'string') node.properties.className = [existing, className];
  else node.properties.className = [className];
}

function labelTable(table) {
  const rows = collect(table, 'tr');
  if (rows.length < 2) return;

  const headerRows = collect(table, 'thead').flatMap((thead) => collect(thead, 'tr'));
  const headerRow = headerRows[0] || rows[0];
  const headers = cellsOf(headerRow).map((c) => textOf(c).trim());

  // Two-column tables read fine as-is; only wider tables need the card treatment.
  if (headers.length <= 2) return;
  addClass(table, 'stacked-table');

  const headerSet = new Set(headerRows.length ? headerRows : [headerRow]);
  for (const row of rows) {
    if (headerSet.has(row)) continue;
    cellsOf(row).forEach((cell, i) => {
      cell.properties = cell.properties || {};
      // hast serializes the `dataLabel` property to the `data-label` attribute.
      cell.properties.dataLabel = headers[i] != null ? headers[i] : '';
    });
  }
}

module.exports = function rehypeTableLabels() {
  return (tree) => {
    collect(tree, 'table').forEach(labelTable);
  };
};
