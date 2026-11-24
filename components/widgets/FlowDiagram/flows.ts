import type { CSSProperties } from 'react';

import { THEME } from './flows.generated.ts';

export { FLOWS, type FlowId, PROJECT, THEME } from './flows.generated.ts';

/** A canvas background. `--flow-focus` is the focus ring color of the controls on the canvas. */
export const CANVAS_STYLE = {
  'background': THEME.gradient,
  '--flow-focus': THEME.focus,
} as CSSProperties;
