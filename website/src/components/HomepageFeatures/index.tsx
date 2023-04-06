import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";
import { useColorMode } from "@docusaurus/theme-common";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
  href?: string;
  addBackground?: boolean;
  animate?: boolean;
};

const FeatureList: FeatureItem[] = [
  {
    title: "A gentle introduction",
    Svg: require("@site/static/img/welcome.svg").default,
    href: "/intro",
    description: <> Learn about Arbitrum's core technologies and product portfolio.</>,
  },
  {
    title: "Quickstart: Build a DApp",
    Svg: require("@site/static/img/cupcake.svg").default,
    href: "/for-devs/quickstart-solidity-hardhat",
    description: <>Deploy a cupcake vending machine contract locally, then to Arbitrum Goerli, then to Arbitrum Mainnet.</>,
  },
  {
    title: "Quickstart: Run a node",
    Svg: require("@site/static/img/node.svg").default,
    href: "/node-running/running-a-node",
    description: <>Learn how to run a full node (Nitro) on your local machine.</>,
  },
  {
    title: "Quickstart: Bridge tokens",
    Svg: require("@site/static/img/layer-up.svg").default,
    href: "/getting-started-users",
    description: <>Learn how to transfer tokens between Ethereum's L1 chain and Arbitrum's L2 chains using Arbitrum Bridge.</>,
  },
  {
    title: "The Arbitrum DAO",
    Svg: require("@site/static/img/logo.svg").default,
    href: "https://docs.arbitrum.foundation/",
    description: <>Learn about the decentralized organization that governs the One and Nova chains.</>,
    animate: true,
  },
  {
    title: "Troubleshoot your node",
    Svg: require("@site/static/img/node.svg").default,
    href: "/node-running/troubleshooting-running-nodes",
    description: <>Use this interactive troubleshooting guide to quickly diagnose your node issues.</>,
  }
];

function Feature({
  title,
  Svg,
  description,
  href,
  addBackground,
  animate,
}: FeatureItem) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === "dark";
  const textStyle = { color: isDarkTheme ? "white" : "black" };
  return (
    <div className={clsx("col col--4")} id={animate && styles.animate}>
      <Link className={styles.landingPageLink} href={href}>
        <div className="text--center">
          <Svg
            style={
              isDarkTheme && addBackground
                ? {
                  backgroundColor: "lightblue",
                  borderRadius: "25%",
                }
                : {}
            }
            className={styles.featureSvg}
            role="img"
          />
        </div>
        <div className="text--center padding-horiz--md info-box">
          <h3 style={textStyle}> {title}</h3>
          <p style={textStyle}>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
