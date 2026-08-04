const { test } = require('node:test');
const assert = require('node:assert').strict;
const { h } = require('hastscript');
const rehypeTableLabels = require('./rehype-table-labels');

// Runs the plugin over a hast tree containing `table` and returns the table.
function run(table) {
  const tree = { type: 'root', children: [table] };
  rehypeTableLabels()(tree);
  return tree.children[0];
}

function bodyRows(table) {
  const tbody = table.children.find((c) => c.tagName === 'tbody');
  return (tbody ? tbody.children : table.children).filter((c) => c.tagName === 'tr');
}

function labelsOf(row) {
  return row.children
    .filter((c) => c.tagName === 'td' || c.tagName === 'th')
    .map((c) => (c.properties || {}).dataLabel);
}

test('labels each body cell with its column header and marks the table stacked', () => {
  const table = h('table', [
    h('thead', [h('tr', [h('th', 'Method'), h('th', 'Source'), h('th', 'Description')])]),
    h('tbody', [h('tr', [h('td', 'foo()'), h('td', 'link'), h('td', 'does a thing')])]),
  ]);

  const out = run(table);

  assert.deepEqual(labelsOf(bodyRows(out)[0]), ['Method', 'Source', 'Description']);
  assert.ok(
    (out.properties.className || []).includes('stacked-table'),
    'wide table should get the stacked-table class',
  );
});

test('leaves two-column tables untouched', () => {
  const table = h('table', [
    h('thead', [h('tr', [h('th', 'Key'), h('th', 'Value')])]),
    h('tbody', [h('tr', [h('td', 'a'), h('td', 'b')])]),
  ]);

  const out = run(table);

  assert.equal((out.properties.className || []).includes('stacked-table'), false);
  assert.deepEqual(labelsOf(bodyRows(out)[0]), [undefined, undefined]);
});

test('empty header cell yields an empty label (contract-address matrix corner)', () => {
  const table = h('table', [
    h('thead', [h('tr', [h('th', ''), h('th', 'Arbitrum One'), h('th', 'Arbitrum Nova')])]),
    h('tbody', [h('tr', [h('td', 'Rollup'), h('td', '0xaaa'), h('td', '0xbbb')])]),
  ]);

  const out = run(table);

  assert.deepEqual(labelsOf(bodyRows(out)[0]), ['', 'Arbitrum One', 'Arbitrum Nova']);
});

test('uses the first row as headers when there is no thead', () => {
  const table = h('table', [
    h('tr', [h('td', 'H1'), h('td', 'H2'), h('td', 'H3')]),
    h('tr', [h('td', 'x'), h('td', 'y'), h('td', 'z')]),
  ]);

  const out = run(table);
  const rows = bodyRows(out);

  // First row is the header and must not be labelled; the data row is.
  assert.deepEqual(labelsOf(rows[0]), [undefined, undefined, undefined]);
  assert.deepEqual(labelsOf(rows[1]), ['H1', 'H2', 'H3']);
});
