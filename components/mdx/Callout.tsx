import type { CSSProperties, ReactNode, SVGProps } from 'react';

/**
 * The callout from the Docusaurus site's `VanillaAdmonition`: a 6px coloured left border, a tint of
 * the same colour, and the icon and title on one row above the content. The icons are its Octicons
 * paths. Each type has one colour per theme, and the tint is 15% on the white page and 20% on the
 * black one, so the fill measures at least 1.2:1 against the page and the body text at least 7:1.
 * The warning type sets its own fill and border; its light fill is 1.11:1, and its border marks the
 * edge. Every type has `role="note"`, never `alert`: a static error callout should not be announced
 * as a live region on every client-side navigation to its page.
 */

type IconProps = SVGProps<SVGSVGElement>;

const iconClass = 'block size-[18px] fill-current';

function InfoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 14 16" aria-hidden="true" className={iconClass} {...props}>
      <path
        fillRule="evenodd"
        d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"
      />
    </svg>
  );
}

function NoteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 14 16" aria-hidden="true" className={iconClass} {...props}>
      <path
        fillRule="evenodd"
        d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"
      />
    </svg>
  );
}

function TipIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 16" aria-hidden="true" className={iconClass} {...props}>
      <path
        fillRule="evenodd"
        d="M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"
      />
    </svg>
  );
}

function WarningIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={iconClass} {...props}>
      <path
        fillRule="evenodd"
        d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"
      />
    </svg>
  );
}

function DangerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 16" aria-hidden="true" className={iconClass} {...props}>
      <path
        fillRule="evenodd"
        d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
      />
    </svg>
  );
}

interface CalloutStyle {
  label: string;
  /** Darker shade for the white page, lighter shade for the black one: each is at least 3:1. */
  light: string;
  dark: string;
  /** Border and background per theme. Default: the type colour, and a 15% / 20% tint of it. */
  border?: { light: string; dark: string };
  fill?: { light: string; dark: string };
  Icon: (props: IconProps) => ReactNode;
}

const green = { light: '#1a7f37', dark: '#3fb950' };
// A soft orange: a peach fill, not a 15% tint of the icon colour. The light fill is 1.11:1 against
// white, so the orange border marks the box edge.
const warning = {
  light: '#c2410c',
  dark: '#fb923c',
  border: { light: '#f28c28', dark: '#f28c28' },
  fill: { light: '#fff1e0', dark: '#2e1a05' },
};

/** Keyed by every type Fumadocs accepts, so pages written for Fumadocs' Callout keep working. */
const calloutStyles: Record<string, CalloutStyle> = {
  info: { label: 'Note', light: '#0366d6', dark: '#4493f8', Icon: InfoIcon },
  tip: { label: 'Tip', ...green, Icon: TipIcon },
  idea: { label: 'Tip', ...green, Icon: TipIcon },
  warn: { label: 'Warning', ...warning, Icon: WarningIcon },
  warning: { label: 'Warning', ...warning, Icon: WarningIcon },
  error: { label: 'Danger', light: '#cf222e', dark: '#f85149', Icon: DangerIcon },
  success: { label: 'Success', ...green, Icon: NoteIcon },
};

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: string;
  title?: ReactNode;
  children?: ReactNode;
}) {
  const { label, light, dark, border, fill, Icon } = calloutStyles[type] ?? calloutStyles.info!;
  const style = {
    '--callout-light': light,
    '--callout-dark': dark,
    '--callout-border-light': border?.light ?? light,
    '--callout-border-dark': border?.dark ?? dark,
    '--callout-fill-light': fill?.light ?? `color-mix(in oklab, ${light} 15%, transparent)`,
    '--callout-fill-dark': fill?.dark ?? `color-mix(in oklab, ${dark} 20%, transparent)`,
  } as CSSProperties;
  return (
    <div
      role="note"
      style={style}
      className="my-4 rounded border-l-[6px] border-(--callout-border-light) bg-(--callout-fill-light) px-3 pt-2.5 pb-1.5 [--callout-color:var(--callout-light)] dark:border-(--callout-border-dark) dark:bg-(--callout-fill-dark) dark:[--callout-color:var(--callout-dark)]"
    >
      <div className="mb-1 flex items-center gap-2 text-(--callout-color)">
        <span className="inline-flex shrink-0 items-center">
          <Icon />
        </span>
        <span className="text-[17px] leading-[1.3] font-semibold text-[#1f2328] dark:text-[#b5c2d3]">
          {title || label}
        </span>
      </div>
      <div className="prose-no-margin text-sm/normal text-[rgba(31,35,40,0.85)] dark:text-[rgba(184,194,205,0.9)]">
        {children}
      </div>
    </div>
  );
}
