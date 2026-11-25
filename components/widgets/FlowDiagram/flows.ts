import type { CSSProperties } from 'react';

import { THEME } from './flows.generated.ts';

export { FLOWS, type FlowId, PROJECT, THEME } from './flows.generated.ts';

/**
 * A canvas background. `--flow-focus` is the focus ring color of the controls on the canvas.
 * The React Flow attribution label: `ink` text on the `attribution` grey.
 */
export const CANVAS_STYLE = {
  'background': THEME.gradient,
  '--flow-focus': THEME.focus,
  '--flow-ink': THEME.ink,
  '--xy-attribution-background-color': THEME.attribution,
} as CSSProperties;
