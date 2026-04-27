import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { usePrismTheme } from '@docusaurus/theme-common';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import { parseCodeTitle, parseCodeWalkthrough } from './codeWalkthroughParser';
import styles from './styles.module.css';

type Props = {
  children: string;
  className?: string;
  language?: string;
  metastring?: string;
  title?: string;
};

function normalizeLanguage(language?: string, className?: string): string {
  const fromClassName = className?.match(/language-([^\s]+)/)?.[1];
  return (language || fromClassName || 'text').toLowerCase();
}

function resolveHighlightLanguage(language: string): string {
  if (defaultProps.Prism.languages[language]) return language;
  if (language === 'solidity' || language === 'rust') return 'clike';
  if (language === 'shell' || language === 'sh') return 'bash';
  return 'text';
}

function isActiveLine(lineNumber: number, startLine: number, endLine: number): boolean {
  return lineNumber >= startLine && lineNumber <= endLine;
}

export function CodeWalkthrough({
  children,
  className,
  language: languageProp,
  metastring,
  title,
}: Props) {
  const parsed = useMemo(() => parseCodeWalkthrough(children), [children]);
  const language = normalizeLanguage(languageProp, className);
  const highlightLanguage = resolveHighlightLanguage(language);
  const prismTheme = usePrismTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = parsed.steps[activeIndex];
  const resolvedTitle = parseCodeTitle(metastring, title);

  const copyCode = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(parsed.code);
  };

  if (parsed.steps.length === 0) {
    return (
      <pre className={className}>
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <div className={styles.codeWalkthrough}>
      <div className={styles.walkthroughCodePane}>
        <div className={styles.walkthroughCodeHeader}>
          <span>{resolvedTitle || language}</span>
          <button type="button" onClick={copyCode} className={styles.secondaryButton}>
            Copy
          </button>
        </div>
        <Highlight
          Prism={defaultProps.Prism}
          theme={prismTheme}
          code={parsed.code}
          language={highlightLanguage as Language}
        >
          {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={clsx(highlightClassName, styles.walkthroughPre, 'thin-scrollbar')}
              style={style}
              tabIndex={0}
            >
              <code>
                {tokens.map((line, index) => {
                  const lineNumber = index + 1;
                  const lineProps = getLineProps({ line });
                  const { key: lineKey, ...linePropsWithoutKey } = lineProps;
                  return (
                    <span
                      key={lineKey || index}
                      {...linePropsWithoutKey}
                      className={clsx(
                        lineProps.className,
                        styles.walkthroughLine,
                        activeStep &&
                          isActiveLine(lineNumber, activeStep.startLine, activeStep.endLine) &&
                          styles.walkthroughLineActive,
                      )}
                    >
                      <span className={styles.walkthroughLineNumber}>{lineNumber}</span>
                      <span className={styles.walkthroughLineContent}>
                        {line.map((token, key) => {
                          const tokenProps = getTokenProps({ token });
                          const { key: tokenKey, ...tokenPropsWithoutKey } = tokenProps;

                          return <span key={tokenKey || key} {...tokenPropsWithoutKey} />;
                        })}
                      </span>
                    </span>
                  );
                })}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
      <div className={styles.walkthroughSteps}>
        {parsed.steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={clsx(styles.walkthroughStep, index === activeIndex && styles.activeStep)}
            onClick={() => setActiveIndex(index)}
          >
            <span className={styles.stepKicker}>
              {index + 1} / {parsed.steps.length}
            </span>
            <span className={styles.stepTitle}>{step.title}</span>
            {step.body && <span className={styles.stepBody}>{step.body}</span>}
          </button>
        ))}
        <div className={styles.walkthroughControls}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={activeIndex === parsed.steps.length - 1}
            onClick={() => setActiveIndex((value) => Math.min(parsed.steps.length - 1, value + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
