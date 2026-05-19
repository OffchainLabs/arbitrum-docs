const PREFIX = 'LLMS_';
const KINDS = ['DETAILS_OPEN', 'DETAILS_CLOSE', 'MATH_INLINE', 'MATH_BLOCK'];
const KIND_SET = new Set(KINDS);

function buildMarkerValue(kind, payload) {
  if (!KIND_SET.has(kind)) {
    throw new Error(`Unknown LLMS marker kind: ${kind}. Valid: ${KINDS.join(', ')}`);
  }
  return `${PREFIX}${kind}:${encodeURIComponent(payload)}`;
}

exports.PREFIX = PREFIX;
exports.MARKER_RE = new RegExp(`^${PREFIX}(${KINDS.join('|')}):([^]*)$`);
exports.buildMarkerValue = buildMarkerValue;
