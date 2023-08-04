import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import { useLocation } from '@docusaurus/router';
import styles from './index.module.css';

// NOTE: Path redirections have been moved to /vercel.json so they are handled in the
// server side by Vercel.

function HomepageHeader(props) {
  const { siteConfig } = useDocusaurusContext();
  const location = useLocation();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {props.notFound ? <>page '{location.pathname}' not found 🤷‍♂️</> : null}
        <h1 className="hero__title">{siteConfig.title}</h1>
        {/* <p className="hero__subtitle">{siteConfig.tagline}</p> */}
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/intro">
            A gentle introduction to Arbitrum 🔵
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(props) {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Arbitrum 🔵`}>
      <HomepageHeader notFound={props.notFound} />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
