import React, { useEffect } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import { useLocation, Redirect } from "@docusaurus/router";

import styles from "./index.module.css";

// NOTE: Path redirections have been moved to /website/src/resources/urlRedirections.js
// and are being turned into a server-side configuration file in /website/src/scripts/generate_redirections.js.
// Although this code is not going to be needed in production, we leave it for now as a fallback and
// for testing redirections on local.

const oldPathToNewPath = require("../resources/urlRedirections");

const getNewPath = (_path) => {
  const path = _path.toLowerCase();

  for (let oldPath of Object.keys(oldPathToNewPath)) {
    if (path.includes(oldPath)) {
      return oldPathToNewPath[oldPath];
    }
  }
};

function HomepageHeader(props) {
  const { siteConfig } = useDocusaurusContext();
  const location = useLocation();

  if (props.notFound) {
    let newPath = getNewPath(location.pathname);
    if (newPath) {
      console.info(`Redirecting from ${location.pathname} to ${newPath}`);
      return <Redirect to={newPath} />;
    }
  }

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
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
