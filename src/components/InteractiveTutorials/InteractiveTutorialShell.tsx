import React, { ReactNode, useEffect } from 'react';
import styles from './styles.module.css';

type Props = {
  children: ReactNode;
  estimatedTime?: string;
  tutorialKind?: string;
};

export function InteractiveTutorialShell({ children }: Props) {
  useEffect(() => {
    document.body.classList.add('interactive-tutorial-page');
    return () => document.body.classList.remove('interactive-tutorial-page');
  }, []);

  return (
    <div className={styles.tutorialShell}>
      <div data-interactive-tutorial-content className={styles.tutorialContent}>
        {children}
      </div>
    </div>
  );
}
