import React, { useEffect } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import { useLocation, Redirect } from "@docusaurus/router";

import styles from "./index.module.css";

const oldPathToNewPath = {
  "/arb-specific-things": "/arbitrum-ethereum-differences",
  "/docs/mainnet": "/mainnet-beta",
  "/migration/dapp-migration": "/migration/dapp_migration",
  "/docs/public_chains": "/for-devs/concepts/public-chains",
  "/docs/inside_arbitrum": "/inside-arbitrum-nitro",
  "/docs/l1_l2_messages": "/arbos/l1-to-l2-messaging",
  "/docs/bridging_assets": "/asset-bridging",
  "/docs/glossary": "/intro/glossary",
  "/docs/anytrust": "/inside-anytrust",
  "/docs/node_providers": "/node-running/node-providers",
  "/docs/useful_addresses": "/for-devs/useful-addresses",
  "/docs/running_node": "/node-running/how-tos/running-a-full-node",
  "/docs/running_nitro_node": "/node-running/how-tos/running-a-full-node",
  "/docs/running_goerli_nitro_node": "/node-running/how-tos/running-a-full-node",
  "/docs/running_rinkeby_nitro_node": "/node-running/how-tos/running-a-full-node",
  "/docs/public_testnet": "/for-devs/concepts/public-chains",
  "/docs/public_nitro_testnet": "/for-devs/concepts/public-chains",
  "/docs/public_nitro_devnet": "/for-devs/concepts/public-chains",
  "/docs/developer_quickstart": "/",
  "/docs/installation": "/node-running/how-tos/running-a-full-node",
  "/docs/rollup_basics": "/intro",
  "/docs/tutorials": "/getting-started-devs",
  "/docs/security_considerations": "/arbitrum-ethereum-differences",
  "/docs/frontend_integration": "/getting-started-devs",
  "/docs/contract_deployment": "/getting-started-devs",
  "/docs/arbsys": "/arbos/precompiles#ArbSys",
  "/docs/finality": "/tx-lifecycle",
  "/docs/withdrawals": "/tx-lifecycle",
  "/docs/differences_overview": "/arbitrum-ethereum-differences",
  "/docs/special_features": "/arbitrum-ethereum-differences",
  "/docs/solidity_support": "/solidity-support",
  "/docs/time_in_arbitrum": "/time",
  "/docs/censorship_resistance": "/sequencer",
  "/docs/arbgas": "/arbos/gas",
  "/docs/arbos": "/arbos",
  "/docs/tx_lifecycle": "/tx-lifecycle",
  "/docs/rollup_protocol": "/assertion-tree",
  "/docs/avm_design": "/inside-arbitrum-nitro",
  "/docs/dispute_resolution": "/proving/challenge-manager",
  "/docs/arbos_formats": "/arbos",
  "/docs/avm_specification": "/proving/wavm-custom-opcodes",
  "/faqs/anytrust-vs-rollup": "/faqs/protocol-faqs#q-rollup-vs-anytrust",
  "/faqs/how-fees": "/faqs/gas-faqs",
  "/faqs/what-if-dispute": "/faqs/protocol-faqs#q-dispute-reorg",
  "/faqs/seq-or-val": "/faqs/protocol-faqs#q-seq-vs-val",
  "/faqs/beta-status": "/mainnet-beta",
  "/faqs/the-merge": "/",

  // File relocations
  "/public-chains": "/for-devs/concepts/public-chains",
  "/useful-addresses": "/for-devs/useful-addresses",
  "/node-running/running-a-classic-node": "/node-running/how-tos/running-a-classic-node",
  "/node-running/running-an-archive-node": "/node-running/how-tos/running-an-archive-node",
  "/node-running/local-dev-node": "/node-running/how-tos/local-dev-node",
  "/node-running/running-a-feed-relay": "/node-running/how-tos/running-a-feed-relay",
  "/node-running/running-a-validator": "/node-running/how-tos/running-a-validator",
  "/node-running/read-sequencer-feed": "/node-running/how-tos/read-sequencer-feed",
  "/node-running/build-nitro-locally": "/node-running/how-tos/build-nitro-locally",
  "node-running/running-a-node": "/node-running/how-tos/running-a-full-node",
};

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
