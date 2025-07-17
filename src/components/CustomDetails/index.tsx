import React from 'react';
import Details from '@theme/Details';
import styles from './styles.module.css';

interface Props {
  children: React.ReactNode;
  summary?: string | React.ReactElement;
  className?: string;
}

export default function CustomDetails({
  children,
  summary,
  className,
  ...props
}: Props): JSX.Element {
  return (
    <Details {...props} summary={summary} className={`${styles.details} ${className || ''}`}>
      {children}
    </Details>
  );
}
