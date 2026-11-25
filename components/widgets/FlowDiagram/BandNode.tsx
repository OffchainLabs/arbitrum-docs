import type { Node, NodeProps } from '@xyflow/react';

import { PROJECT } from './flows.ts';
import type { Band } from './layout.ts';

export type BandNodeType = Node<{ band: Band; active: boolean }, 'band'>;

/** The translucent band behind one lane's rows. It has no header; the Key names it. */
export function BandNode({ data }: NodeProps<BandNodeType>) {
  const { band, active } = data;
  const style = PROJECT.lanes[band.chain]!.widget!;
  return (
    <div
      className={[
        'pointer-events-none',
        'motion-safe:transition-[background-color,border-color] motion-safe:duration-200',
      ].join(' ')}
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
