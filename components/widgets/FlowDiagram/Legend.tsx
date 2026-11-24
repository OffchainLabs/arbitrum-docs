import { useState } from 'react';

import { BRAND } from './brand.ts';
import { PROJECT } from './flows.ts';
import { type Flow, kindKey } from './model.ts';

const CHIP_STYLE = { background: BRAND.chip, color: BRAND.chipText, fontFamily: BRAND.font };

/** The color key. Below 768px it folds into a "Key" button at the top left of the canvas. */
export function Legend({ flow, narrow }: { flow: Flow; narrow: boolean }) {
  const [open, setOpen] = useState(false);
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
            // The site focus ring, #016be5, has about 2.8:1 contrast on the chip color.
            'focus-visible:outline-[#eaf5ff]',
          ].join(' ')}
          style={CHIP_STYLE}
        >
          Key
        </button>
      )}
      {/* Rendered conditionally: the `hidden` attribute loses to the `flex` class. */}
      {(!narrow || open) && (
        <div
          data-flow-key=""
          className={[
            'absolute left-3 z-20 flex flex-col gap-1 rounded-md p-2 text-xs',
            narrow ? 'top-12' : 'top-3',
          ].join(' ')}
          style={CHIP_STYLE}
        >
          {Object.entries(PROJECT.kinds).map(([id, kind]) => (
            <span key={id} className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-sm"
                style={{ background: kind.widget.fill, outline: `1px solid ${BRAND.connector}` }}
              />
              {kindKey(flow, id, kind)}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
