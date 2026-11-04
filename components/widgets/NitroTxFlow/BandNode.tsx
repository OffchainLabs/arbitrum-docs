import type { Node, NodeProps } from '@xyflow/react';

import { BAND_STYLE } from './brand.ts';
import type { Band } from './layout.ts';

export type BandNodeType = Node<{ band: Band; active: boolean }, 'band'>;

/** The translucent band behind one chain's rows. It has no header; `BandLabels` names it. */
export function BandNode({ data }: NodeProps<BandNodeType>) {
  const { band, active } = data;
  const style = BAND_STYLE[band.chain];
  return (
    <div
      className="pointer-events-none motion-safe:transition-[background-color,border-color] motion-safe:duration-200"
      style={{
        width: band.box.width,
        height: band.box.height,
        borderRadius: 12,
        background: style.fill[active ? 1 : 0],
        border: `2px solid ${style.border[active ? 1 : 0]}`,
      }}
    />
  );
}
