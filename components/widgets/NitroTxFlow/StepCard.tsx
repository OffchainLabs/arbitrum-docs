import type { ReactNode } from 'react';
import { useState } from 'react';

import { vars } from '@/content/vars';

import { FINALITY_LABEL } from './brand.ts';
import { codeUrl } from './links.ts';
import type { Step } from './model.ts';

/** The card below the canvas: finality, title, text, and the operator details. */
export function StepCard({ step }: { step: Step }) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="border-t border-fd-border p-4">
      {step.finality && (
        <span
          className={[
            'mb-3 inline-block rounded-full bg-fd-primary/15 px-2 py-0.5 text-xs font-medium',
            'text-fd-primary',
          ].join(' ')}
        >
          {FINALITY_LABEL[step.finality]}
        </span>
      )}
      <h3 className="text-lg font-semibold">{step.title}</h3>
      <p className="mt-1">{step.text}</p>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showDetails}
          onChange={(event) => setShowDetails(event.target.checked)}
        />
        Show operator details
      </label>

      {showDetails && (
        <dl className="mt-3 grid gap-2 text-sm">
          {step.flag && <Detail term="Flag" value={<code>{step.flag}</code>} />}
          {step.code && (
            <Detail
              term="Code"
              value={
                <a
                  className="underline"
                  href={codeUrl(step.code, vars)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {step.code.path}
                </a>
              }
            />
          )}
          <Detail term="What the operator sees" value={step.failure.symptoms} />
          <Detail term="Impact on the transaction" value={step.failure.impact} />
          <Detail term="Recovery" value={step.failure.recovery} />
        </dl>
      )}
    </div>
  );
}

function Detail({ term, value }: { term: string; value: ReactNode }) {
  return (
    <div>
      <dt className="font-medium">{term}</dt>
      <dd className="text-fd-muted-foreground">{value}</dd>
    </div>
  );
}
