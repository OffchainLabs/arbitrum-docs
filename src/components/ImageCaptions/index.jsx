import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';

export default function ImageWithCaption({ src, caption }) {
  return (
    <imageWithCaption className={styles.figure}>
      <img src={useBaseUrl(src)} alt={caption} className={styles.image} />
      <imgcaption className={styles.caption}>{`${caption}`}</imgcaption>
    </imageWithCaption>
  );
}
