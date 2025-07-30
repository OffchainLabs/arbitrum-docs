import React, { ReactNode } from 'react';
import { DangerIcon, InfoIcon, NoteIcon, TipIcon, WarningIcon } from './Icons';
import styles from './styles.module.css';

type AdmonitionType = 'note' | 'tip' | 'info' | 'warning' | 'danger';

interface AdmonitionProps {
  type: AdmonitionType;
  title?: string;
  children: ReactNode;
}

const defaultTitles: Record<AdmonitionType, string> = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
};

const icons: Record<AdmonitionType, React.ReactNode> = {
  note: <NoteIcon className={styles.icon} />,
  tip: <TipIcon className={styles.icon} />,
  info: <InfoIcon className={styles.icon} />,
  warning: <WarningIcon className={styles.icon} />,
  danger: <DangerIcon className={styles.icon} />,
};

export function VanillaAdmonition({ type, title, children }: AdmonitionProps) {
  return (
    <div className={`${styles.admonition} ${styles[type]}`}>
      <div className={styles.admonitionHeader}>
        <span className={styles.admonitionIcon}>{icons[type]}</span>
        <span className={styles.admonitionTitle}>{title || defaultTitles[type]}</span>
      </div>
      <div className={styles.admonitionContent}>{children}</div>
    </div>
  );
}
