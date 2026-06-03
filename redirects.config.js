/**
 * Internal doc redirects: old URL -> new URL.
 *
 * Entries between the AUTO-GENERATED markers are maintained by `yarn move-doc`. Consumed by
 * `@docusaurus/plugin-client-redirects` (in-app) and `yarn sync-redirects` (which mirrors them
 * into vercel.json for the edge). Types live in redirects.config.d.ts.
 *
 * This is a `.js` module (not `.ts`) so it resolves natively in both the Docusaurus config and
 * webpack's build-dependency cache; `redirects.config.d.ts` supplies the types for the tooling.
 */
export const redirects = [
  // AUTO-GENERATED REDIRECTS START
  {
    from: '/launch-arbitrum-chain/a-gentle-introduction',
    to: '/launch-arbitrum-chain/overview/introduction',
  },
  { from: '/launch-arbitrum-chain/aep-license', to: '/launch-arbitrum-chain/overview/license' },
  {
    from: '/launch-arbitrum-chain/migrate-between-raases',
    to: '/launch-arbitrum-chain/migrate/between-raases',
  },
  {
    from: '/launch-arbitrum-chain/migrate-from-another-stack',
    to: '/launch-arbitrum-chain/migrate/from-another-stack',
  },
  {
    from: '/launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config',
    to: '/launch-arbitrum-chain/deploy/configure-node',
  },
  {
    from: '/launch-arbitrum-chain/concepts/public-preview-expectations',
    to: '/launch-arbitrum-chain/overview/public-preview',
  },
  {
    from: '/launch-arbitrum-chain/faq-troubleshooting/troubleshooting-building-arbitrum-chain',
    to: '/launch-arbitrum-chain/overview/faq',
  },
  {
    from: '/launch-arbitrum-chain/ecosystem-support/add-arbitrum-chain-to-bridge-ui',
    to: '/launch-arbitrum-chain/integrations/bridge-ui',
  },
  {
    from: '/launch-arbitrum-chain/arbitrum-node-runners/run-split-validator-node',
    to: '/launch-arbitrum-chain/run-a-node/split-validator-node',
  },
  {
    from: '/launch-arbitrum-chain/arbitrum-node-runners/high-availability-sequencer-docs',
    to: '/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
  },
  {
    from: '/launch-arbitrum-chain/arbitrum-node-runners/run-batch-poster',
    to: '/launch-arbitrum-chain/run-a-node/batch-poster',
  },
  {
    from: '/launch-arbitrum-chain/third-party-integrations/bridged-usdc-standard',
    to: '/launch-arbitrum-chain/integrations/bridged-usdc',
  },
  // AUTO-GENERATED REDIRECTS END
];
