import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Card.module.css';

function Card({ title, description, to, href }) {
  const isExternal = href !== undefined;
  const linkProps = isExternal ? { href } : { to };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p>{description}</p>
      <Link {...linkProps} className={styles.cardLink}>
        Learn more →
      </Link>
    </div>
  );
}

export default Card;
