import type { ReactNode } from 'react';
import { useState } from 'react';

import { vars } from '@/content/vars';

import { PROJECT } from './flows.ts';
import { codeUrl } from './links.ts';
import type { CardLabels, Step } from './model.ts';
import { fillVars } from './text.ts';

const BADGE_CLASS = [
  'mb-3 inline-block rounded-full bg-fd-primary/15 px-2 py-0.5 text-xs font-medium',
  'text-fd-primary',
].join(' ');

/** The card below the canvas: finality, title, text, docs link, and the details with labels. */
export function StepCard({ step, labels }: { step: Step; labels: CardLabels }) {
  const [showDetails, setShowDetails] = useState(false);
  const showFlag = labels.showFlag && step.flag !== undefined;
  const hasDetails = showFlag || step.code !== undefined || step.failure !== undefined;
  return (
    <div className="border-t border-fd-border p-4">
      {step.finality && <FinalityBadge finality={step.finality} />}
      <h3 className="text-lg font-semibold">{step.title}</h3>
      <p className="mt-1">{fillVars(step.text, vars)}</p>
      {step.docs && (
        <p className="mt-2 text-sm">
          <a className="underline" href={step.docs.href}>
            {step.docs.label}
          </a>
        </p>
      )}

      {hasDetails && (
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(event) => setShowDetails(event.target.checked)}
          />
          {labels.detailsToggle}
        </label>
      )}

      {hasDetails && showDetails && (
        <dl className="mt-3 grid gap-2 text-sm">
          {showFlag && <Detail term="Flag" value={<code>{step.flag}</code>} />}
          {step.code && (
            <Detail
              term="Code"
              value={
                <a
                  className="underline"
                  href={codeUrl(step.code, PROJECT.repos, vars)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {step.code.path}
                </a>
              }
            />
          )}
          {step.failure && (
            <>
              <Detail term={labels.symptoms} value={step.failure.symptoms} />
              <Detail term={labels.impact} value={step.failure.impact} />
              <Detail term={labels.recovery} value={step.failure.recovery} />
            </>
          )}
        </dl>
      )}
    </div>
  );
}

/** A finality with a glossary entry links to it. */
function FinalityBadge({ finality }: { finality: string }) {
  const { label, term } = PROJECT.finality[finality]!;
  if (term === undefined) return <span className={BADGE_CLASS}>{label}</span>;
  return (
    <a className={`${BADGE_CLASS} underline`} href={`/glossary#${term}`}>
      {label}
    </a>
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
