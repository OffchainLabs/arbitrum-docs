import React, { useEffect } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import { useLocation, Redirect } from "@docusaurus/router";

import styles from "./index.module.css";

const oldPathToNewPath = {
  "/docs/mainnet/": "/mainnet-beta",
  "/migration/dapp-migration/": "/migration/dapp_migration",
  "/docs/public_chains/": "/public-chains",
  "/docs/inside_arbitrum/": "/inside-arbitrum-nitro",
  "/docs/l1_l2_messages/": "/arbos/l1-to-l2-messaging",
  "/docs/bridging_assets/": "/asset-bridging",
  "/docs/glossary/": "/intro/glossary",
  "/docs/anytrust/": "/inside-anytrust",
  "/docs/node_providers/": "/node-running/node-providers"
};

function HomepageHeader(props) {
  const { siteConfig } = useDocusaurusContext();
  const location = useLocation();

  if (props.notFound) {
    const normalizedPath = (location.pathname.endsWith("/")
      ? location.pathname
      : location.pathname + "/"
    ).toLowerCase();

    let newPath = "";
    if ((newPath = oldPathToNewPath[normalizedPath])) {
      console.info("redirecting to ", newPath);

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
            Gentle Introduction to Arbitrum 🔵
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(props) {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader notFound={props.notFound} />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
