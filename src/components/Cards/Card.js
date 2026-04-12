import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Card.module.css';

function Card({ title, description, to, href, target }) {
  const isExternal = href !== undefined;
  const linkProps = isExternal ? { href, target } : { to, target };

  return (
    <Link {...linkProps} className={styles.card}>
      <h3 className={styles.cardH3}>{title}</h3>
      <p className={styles.cardP}>{description}</p>
    </Link>
  );
}

export default Card;
