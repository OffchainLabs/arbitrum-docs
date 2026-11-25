import { useState } from 'react';

import { PROJECT, THEME } from './flows.ts';
import { type Flow, kindKey } from './model.ts';

const CHIP_STYLE = { background: THEME.chip, color: THEME.ink, fontFamily: THEME.font };
// The strip's bottom rule: the connector color at 30%.
const KEY_RULE = `color-mix(in srgb, ${THEME.connector} 30%, transparent)`;

/**
 * The color key: the node kinds, then the chains whose bands the flow draws, each with a swatch
 * drawn like its band. From 768px a strip across the canvas top; below, a "Key" button at the top
 * left of the canvas that opens it as a box.
 */
export function Legend({ flow, narrow }: { flow: Flow; narrow: boolean }) {
  const [open, setOpen] = useState(false);
  const chains =
    flow.showChains === false
      ? []
      : Object.entries(PROJECT.lanes).filter(
          ([id, lane]) => lane.widget && flow.actors.some((actor) => actor.chain === id),
        );
  return (
    <>
      {narrow && (
        <button
          type="button"
          data-flow-key=""
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={[
            'absolute top-3 left-3 z-20 rounded-md px-3 py-1 text-xs',
            // THEME.focus, not the site focus ring, which has too little contrast on THEME.chip.
            'focus-visible:outline-(--flow-focus)',
          ].join(' ')}
          style={CHIP_STYLE}
        >
          Key
        </button>
      )}
      {/* Rendered conditionally: the `hidden` attribute loses to the `flex` class. From 768px
          a strip across the canvas top, which the camera frames below (`data-flow-key-strip`),
          so the key never covers a node. It stops short of the React Flow attribution in the top
          right corner. Below 768px a box under the Key button. */}
      {(!narrow || open) && (
        <div
          data-flow-key=""
          data-flow-key-strip={narrow ? undefined : ''}
          className={[
            'absolute z-20 flex text-xs',
            narrow
              ? 'top-12 left-3 flex-col gap-1 rounded-md p-2'
              : 'top-0 right-16 left-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-br-md px-3 py-1.5',
          ].join(' ')}
          style={{ ...CHIP_STYLE, ...(narrow ? {} : { borderBottom: `1px solid ${KEY_RULE}` }) }}
        >
          {Object.entries(PROJECT.kinds).map(([id, kind]) => (
            <span key={id} className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-sm"
                style={{ background: kind.widget.fill, outline: `1px solid ${THEME.connector}` }}
              />
              {kindKey(flow, id, kind)}
            </span>
          ))}
          {chains.length > 0 &&
            (narrow ? (
              <hr className="my-0.5 border-white/20" />
            ) : (
              <span aria-hidden="true" className="h-3.5 w-px bg-white/25" />
            ))}
          {chains.map(([id, lane]) => (
            <span key={id} className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-sm"
                style={{
                  background: lane.widget!.fill[1],
                  border: `1.5px solid ${lane.widget!.border[1]}`,
                }}
              />
              {lane.label}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
