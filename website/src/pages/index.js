import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

// NOTE: Path redirections have been moved to /vercel.json so they are handled in the
// server side by Vercel.

function HomepageHeader(props) {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.heroBanner}>
      <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
      {/* <p className="hero__subtitle">{siteConfig.tagline}</p> */}
      <Link to="/welcome/arbitrum-gentle-introduction">
        <button className={styles.button}>A gentle introduction</button>
      </Link>
    </header>
  );
}

export default function Home(props) {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Arbitrum 🔵`}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
