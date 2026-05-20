import React, { ReactNode, useEffect, useState } from 'react';
import { SolidityLab, SolidityLabProps } from './SolidityLab';
import styles from './styles.module.css';

type TutorialStepProps = {
  id: string;
  title: string;
  checkpoint?: string;
  children: ReactNode;
};

type SolidityLabStepProps = TutorialStepProps & {
  lab: SolidityLabProps;
};

type CommandBlockProps = {
  command: string;
  expectedOutput?: string;
  title?: string;
};

type ChecklistItem = {
  title: string;
  body?: string;
  href?: string;
};

type TutorialChecklistProps = {
  title: string;
  items: ChecklistItem[];
  storageId?: string;
};

function checklistStorageKey(storageId?: string) {
  if (typeof window === 'undefined') return 'interactive-checklist:ssr';
  return `interactive-checklist:${storageId || window.location.pathname}`;
}

export function TutorialStep({ id, title, checkpoint, children }: TutorialStepProps) {
  return (
    <section id={id} data-tutorial-step data-tutorial-title={title} className={styles.stepSection}>
      <h2>{title}</h2>
      <div>{children}</div>
      {checkpoint && <div className={styles.checkpoint}>{checkpoint}</div>}
    </section>
  );
}

export function SolidityLabStep({ id, title, checkpoint, children, lab }: SolidityLabStepProps) {
  const hasIntro = React.Children.count(children) > 0;

  return (
    <section id={id} data-tutorial-step data-tutorial-title={title} className={styles.stepSection}>
      <h2>{title}</h2>
      <div className={styles.labStepLayout}>
        {hasIntro && <div className={styles.labStepCopy}>{children}</div>}
        <SolidityLab {...lab} />
      </div>
      {checkpoint && <div className={styles.checkpoint}>{checkpoint}</div>}
    </section>
  );
}

export function TutorialChecklist({ title, items, storageId }: TutorialChecklistProps) {
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(checklistStorageKey(storageId));
    if (stored) setChecked(JSON.parse(stored));
  }, [storageId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(checklistStorageKey(storageId), JSON.stringify(checked));
  }, [checked, storageId]);

  const toggle = (index: number) => {
    setChecked((value) =>
      value.includes(index) ? value.filter((item) => item !== index) : [...value, index],
    );
  };

  return (
    <div className={styles.checklist}>
      <div className={styles.checklistHeader}>
        <span className={styles.stepKicker}>Interactive checklist</span>
        <strong>{title}</strong>
      </div>
      <div className={styles.checklistItems}>
        {items.map((item, index) => {
          const isChecked = checked.includes(index);
          const titleContent = item.href ? <a href={item.href}>{item.title}</a> : item.title;

          return (
            <label key={item.title} className={styles.checklistItem}>
              <input type="checkbox" checked={isChecked} onChange={() => toggle(index)} />
              <span>
                <strong>{titleContent}</strong>
                {item.body && <small>{item.body}</small>}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function CommandBlock({ command, expectedOutput, title }: CommandBlockProps) {
  const copyCommand = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(command);
  };

  return (
    <div className={styles.commandBlock}>
      <div className={styles.walkthroughCodeHeader}>
        <span>{title || 'Command'}</span>
        <button type="button" onClick={copyCommand} className={styles.secondaryButton}>
          Copy
        </button>
      </div>
      <pre className={styles.commandPre}>
        <code>{command}</code>
      </pre>
      {expectedOutput && (
        <div className={styles.expectedOutput}>
          <span className={styles.stepKicker}>Expected output</span>
          <pre>
            <code>{expectedOutput}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
