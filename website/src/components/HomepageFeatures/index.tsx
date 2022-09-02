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
};

const FeatureList: FeatureItem[] = [
  {
    title: "Introduction",
    Svg: require("@site/static/img/welcome.svg").default,
    href: "/intro/",
    description: <> Overview for New Devs / Users </>
  },
  {
    title: "For Developers",
    Svg: require("@site/static/img/builder.svg").default,
    href: "/getting-started-devs",
    description: <>Guides for Dapp Devs and Node Runners</>
  },
  {
    title: "How It All Works",
    Svg: require("@site/static/img/bulb.svg").default,
    href: "/tx-lifecycle",

    description: <>Technical Overview and specs</>
  },
  {
    title: "Whitepaper",
    Svg: require("@site/static/img/paper.svg").default,
    href:
      "https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf",
    description: <>Arbitrum Nitro Whitepaper</>,
    addBackground: true
  },
  {
    title: "Research Forum",
    Svg: require("@site/static/img/group.svg").default,
    href: "https://research.arbitrum.io/",
    description: <>Public forum for research disucssion</>,
    addBackground: true
  },
  {
    title: "The Code",
    Svg: require("@site/static/img/logo.svg").default,
    href: "https://github.com/OffchainLabs/nitro",
    description: <>View and contribute to the source code</>
  }
];

function Feature({
  title,
  Svg,
  description,
  href,
  addBackground
}: FeatureItem) {
  const { isDarkTheme } = useColorMode();
  const textStyle = { color: isDarkTheme ? "white" : "black" };
  return (
    <div className={clsx("col col--4")}>
      <Link className={styles.landingPageLink} href={href}>
        <div className="text--center">
          <Svg
            style={{
              backgroundColor: isDarkTheme && addBackground && "lightblue"
            }}
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
