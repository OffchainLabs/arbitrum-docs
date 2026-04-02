import React from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: string;
  href?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Deploy Smart Contracts',
    href: '/build-decentralized-apps/quickstart-solidity-remix',
    description:
      'Deploy a cupcake vending machine contract locally, then to Arbitrum Sepolia, then to Arbitrum Mainnet.',
  },
  {
    title: 'Run a node',
    href: '/run-arbitrum-node/overview',
    description: 'Learn how to run a node to interact with any Arbitrum network.',
  },
  {
    title: 'Stylus',
    href: '/stylus/quickstart',
    description: 'Use Stylus to write an EVM-compatible smart contract in Rust.',
  },
  {
    title: 'Bridge tokens',
    href: '/arbitrum-bridge/quickstart',
    description:
      "Learn how to transfer tokens between Ethereum's L1 chain and Arbitrum's L2 chains using Arbitrum Bridge.",
  },
];

function Feature({ title, description, href }: FeatureItem) {
  return (
    <Link href={href} className={styles.featureCard}>
      <div className={styles.GlassContainer}>
        <div className={styles.GlassContent}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className={styles.GlassMaterial}>
          <div className={styles.GlassEdgeReflection}></div>
          <div className={styles.GlassEmbossReflection}></div>
          <div className={styles.GlassRefraction}></div>
          <div className={styles.GlassBlur}></div>
          <div className={styles.BlendLayers}></div>
          <div className={styles.BlendEdge}></div>
          <div className={styles.Highlight}></div>
        </div>
      </div>
    </Link>
  );
}

function InkeepSearchInner() {
  const { siteConfig } = useDocusaurusContext();
  const apiKey = siteConfig.customFields?.inkeepApiKey as string;
  const [EmbeddedSearch, setEmbeddedSearch] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    import('@inkeep/cxkit-react').then((mod) => {
      setEmbeddedSearch(() => mod.InkeepSearchBar);
    });
  }, []);

  if (!EmbeddedSearch) return null;

  return (
    <EmbeddedSearch
      baseSettings={{
        apiKey,
        primaryBrandColor: '#213147',
        organizationDisplayName: 'Arbitrum',
        colorMode: {
          sync: {
            target: 'html',
            attributes: ['data-theme'],
          },
        },
        theme: {
          styles: [
            {
              key: 'homepage-search-bar',
              type: 'style',
              value: `
                button.min-h-9 {
                  min-height: 54px !important;
                }
                .ikp-search-bar__text {
                  color: #999898;
                }
                @media screen and (min-width: 1024px) {
                  .ikp-search-bar__text {
                    font-size: 20px;
                  }
                }
              `,
            },
          ],
        },
      }}
      searchSettings={{
        placeholder: 'How can I help you today?',
      }}
      modalSettings={{
        shouldOpenLinksInNewTab: true,
      }}
      aiChatSettings={{
        aiAssistantAvatar: '/img/logo.svg',
        exampleQuestions: [
          'How to estimate gas in Arbitrum?',
          'What is the difference between Arbitrum One and Nova?',
          'How to deploy a smart contract on Arbitrum?',
          'What are Arbitrum Orbit chains?',
        ],
        botName: 'Arbitrum Assistant',
        getStartedMessage:
          "Hi! I'm here to help you navigate Arbitrum documentation. Ask me anything about building on Arbitrum, deploying contracts, or understanding our technology.",
      }}
    />
  );
}

function InkeepSearch() {
  return <BrowserOnly>{() => <InkeepSearchInner />}</BrowserOnly>;
}

export default function HomepageFeatures(): React.ReactElement {
  return (
    <section className={styles.features}>
      <h1 className={styles.heading}>Welcome to Arbitrum Docs</h1>
      <div className={styles.inkeepSearchWrapper}>
        <InkeepSearch />
      </div>
      <div className={styles.featureCardsWrapper}>
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}
