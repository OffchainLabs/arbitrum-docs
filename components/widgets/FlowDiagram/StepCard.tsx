import type { KeyboardEvent, ReactNode } from 'react';
import { useId, useRef, useState } from 'react';

import { vars } from '@/content/vars';

import { BRAND } from './brand.ts';
import { PROJECT } from './flows.ts';
import { codeUrl } from './links.ts';
import type { CardLabels, Step } from './model.ts';
import { fillVars } from './text.ts';

const BADGE_CLASS = 'inline-block rounded-full px-2 py-0.5 text-xs font-medium';
// The card's own colors, or, in a caption, the colors of the dock around it.
const CARD_BADGE = `${BADGE_CLASS} mb-3 bg-fd-primary/15 text-fd-primary`;
const CAPTION_BADGE = `${BADGE_CLASS} mb-1.5 bg-white/15`;
const CODE_CLASS = 'rounded px-1 py-px font-mono text-[0.9em] break-words';
const CARD_CODE = `${CODE_CLASS} bg-fd-muted`;
const CAPTION_CODE = `${CODE_CLASS} bg-white/10`;
const INLINE_CODE = /`([^`]+)`/g;
// Underlined tabs on a rule, the pattern readers know as tabs: pills read as tags.
const TAB_LIST = 'mt-2 flex gap-4 border-b';
const TAB_CLASS = '-mb-px border-b-2 px-0.5 pb-1 text-sm font-medium';
// Per variant: the rule, an idle tab, the selected tab. The caption's selected underline is the
// brand blue of the edge step badges, set inline from BRAND.
const TAB_STATE = {
  card: {
    list: 'border-fd-border',
    idle: [
      'border-transparent text-fd-muted-foreground',
      'hover:border-fd-border hover:text-fd-foreground',
    ].join(' '),
    selected: 'border-fd-primary text-fd-foreground',
  },
  caption: {
    list: 'border-white/20',
    idle: 'border-transparent opacity-70 hover:border-white/40 hover:opacity-100',
    selected: '',
  },
} as const;

/**
 * Flow text with each `backticked` span as code: a method, parameter, event, flag or value a reader
 * would type. A lone backtick stays as text.
 */
function withCode(text: string, codeClass: string): ReactNode[] {
  return text.split(INLINE_CODE).map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className={codeClass}>
        {part}
      </code>
    ) : (
      part
    ),
  );
}

/** The finality levels a path reaches, in order, and how far the reader's step has reached. */
export interface FinalityTrackData {
  levels: string[];
  // The index in `levels` of the last level reached by this step, or -1 before the first.
  reached: number;
}

interface StepCardProps {
  step: Step;
  labels: CardLabels;
  // The caption in the widget's step dock, on the dock's dark chip color.
  caption?: boolean;
  // In a caption, replaces the step's own finality badge, so every step shows the ladder.
  track?: FinalityTrackData | undefined;
  // Show all is on: the caption folds to its track and title, with a way back to the step.
  collapsed?: boolean;
  onShowStep?: () => void;
}

type Tab = 'overview' | 'failure';

/**
 * The step's finality, title and text, then a footer with the docs link, the code link and the
 * flag. A step with failure text gets two tabs over the text: what happens, and what happens when
 * it fails. The content swaps in place, so it never opens below the caption's capped height. A card
 * below the canvas in the detail dialog; a caption above the step bar in the widget.
 */
export function StepCard({
  step,
  labels,
  caption = false,
  track,
  collapsed = false,
  onShowStep,
}: StepCardProps) {
  const id = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ overview: null, failure: null });
  // Kept across steps, so a reader can walk the failure modes. A step without one shows its text.
  const [selected, setSelected] = useState<Tab>('overview');
  const tab: Tab = step.failure ? selected : 'overview';
  const showFlag = labels.showFlag && step.flag !== undefined;
  const codeClass = caption ? CAPTION_CODE : CARD_CODE;
  const tabState = TAB_STATE[caption ? 'caption' : 'card'];
  const tabs: [Tab, string][] = [
    ['overview', labels.overviewTab],
    ['failure', labels.failureTab],
  ];

  // Stops the keys it uses, so the arrow keys do not also step the diagram.
  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const next: Tab = ['ArrowLeft', 'Home'].includes(event.key) ? 'overview' : 'failure';
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={caption ? 'px-2 pt-1 pb-2 text-sm' : 'border-t border-fd-border p-4'}>
      {track ? (
        <FinalityTrack track={track} step={step} />
      ) : (
        step.finality && (
          <FinalityBadge
            finality={step.finality}
            className={caption ? CAPTION_BADGE : CARD_BADGE}
          />
        )
      )}
      <h3 className={caption ? 'text-base font-semibold' : 'text-lg font-semibold'}>
        {step.title}
      </h3>
      {collapsed && (
        <button type="button" className="mt-1 text-[13px] underline" onClick={onShowStep}>
          Back to this step
        </button>
      )}
      {!collapsed && (
        <>
          {step.failure && (
            <div
              role="tablist"
              aria-label={`${step.title}: details`}
              onKeyDown={onTabKeyDown}
              className={`${TAB_LIST} ${tabState.list}`}
            >
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  ref={(element) => {
                    tabRefs.current[key] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-${key}-tab`}
                  aria-controls={`${id}-panel`}
                  aria-selected={tab === key}
                  tabIndex={tab === key ? 0 : -1}
                  onClick={() => setSelected(key)}
                  className={`${TAB_CLASS} ${tab === key ? tabState.selected : tabState.idle}`}
                  style={caption && tab === key ? { borderBottomColor: BRAND.badge } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div
            id={`${id}-panel`}
            role={step.failure ? 'tabpanel' : undefined}
            aria-labelledby={step.failure ? `${id}-${tab}-tab` : undefined}
          >
            {tab === 'overview' && (
              <p className={caption ? 'mt-1 leading-snug' : 'mt-1'}>
                {withCode(fillVars(step.text, vars), codeClass)}
              </p>
            )}
            {tab === 'failure' && step.failure && (
              <div className={`grid gap-1.5 ${caption ? 'mt-1.5 leading-snug' : 'mt-2'}`}>
                <Detail term={labels.symptoms} value={withCode(step.failure.symptoms, codeClass)} />
                <Detail term={labels.impact} value={withCode(step.failure.impact, codeClass)} />
                <Detail term={labels.recovery} value={withCode(step.failure.recovery, codeClass)} />
              </div>
            )}
          </div>

          {(step.docs || step.code || showFlag) && (
            <p
              className={[
                'flex flex-wrap items-baseline gap-x-4 gap-y-1',
                caption ? 'mt-2 text-[13px]' : 'mt-3 text-sm',
              ].join(' ')}
            >
              {step.docs && (
                <a className="underline" href={step.docs.href}>
                  {step.docs.label}
                </a>
              )}
              {step.code && (
                <span>
                  Code:{' '}
                  <a
                    className="underline"
                    href={codeUrl(step.code, PROJECT.repos, vars)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {step.code.path}
                  </a>
                </span>
              )}
              {showFlag && (
                <span>
                  Flag: <code className={codeClass}>{step.flag}</code>
                </span>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * The path's finality levels as a ladder: reached levels filled with a check, the level this step
 * reaches outlined in the brand blue, later levels dim and dashed. Each links its glossary entry.
 */
function FinalityTrack({ track, step }: { track: FinalityTrackData; step: Step }) {
  return (
    <ol aria-label="Finality" className="mb-1.5 flex flex-wrap items-center gap-1 text-[11px]">
      <li className="mr-0.5 opacity-70">Finality:</li>
      {track.levels.map((level, i) => {
        const { label, term } = PROJECT.finality[level]!;
        const reached = i <= track.reached;
        const now = i === track.reached && step.finality === level;
        const chip = (
          <>
            {reached && <span aria-hidden="true">✓ </span>}
            {label}
            <span className="sr-only">{reached ? ' (reached)' : ' (not yet)'}</span>
          </>
        );
        const className = [
          'inline-block rounded-full px-2 py-0.5 font-medium',
          reached ? 'bg-white/15' : 'border border-dashed border-white/30 opacity-60',
        ].join(' ');
        const style = now ? { boxShadow: `0 0 0 1.5px ${BRAND.badge}` } : undefined;
        return (
          <li
            key={level}
            className="flex items-center gap-1"
            aria-current={now ? 'step' : undefined}
          >
            {i > 0 && (
              <span aria-hidden="true" className="opacity-50">
                ›
              </span>
            )}
            {term === undefined ? (
              <span className={className} style={style}>
                {chip}
              </span>
            ) : (
              <a className={`${className} underline`} style={style} href={`/glossary#${term}`}>
                {chip}
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** A finality with a glossary entry links to it. */
function FinalityBadge({ finality, className }: { finality: string; className: string }) {
  const { label, term } = PROJECT.finality[finality]!;
  if (term === undefined) return <span className={className}>{label}</span>;
  return (
    <a className={`${className} underline`} href={`/glossary#${term}`}>
      {label}
    </a>
  );
}

// A run-in term, as the flow source writes it, so the three paragraphs fit the capped caption.
function Detail({ term, value }: { term: string; value: ReactNode }) {
  return (
    <p>
      <strong className="font-semibold">{term}.</strong> {value}
    </p>
  );
}
