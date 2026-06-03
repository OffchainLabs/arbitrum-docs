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
  {
    from: '/launch-arbitrum-chain/third-party-integrations/third-party-providers',
    to: '/launch-arbitrum-chain/integrations/infrastructure-providers',
  },
  {
    from: '/launch-arbitrum-chain/customize-your-chain/customize-arbos',
    to: '/launch-arbitrum-chain/chain-configuration/core/arbos',
  },
  {
    from: '/launch-arbitrum-chain/customize-your-chain/customize-precompile',
    to: '/launch-arbitrum-chain/chain-configuration/core/precompiles',
  },
  {
    from: '/launch-arbitrum-chain/customize-your-chain/customize-stf',
    to: '/launch-arbitrum-chain/chain-configuration/core/stf',
  },
  {
    from: '/launch-arbitrum-chain/maintain-your-chain/ownership-structure-access-control',
    to: '/launch-arbitrum-chain/operate/ownership-and-access',
  },
  {
    from: '/launch-arbitrum-chain/maintain-your-chain/guidance/post-launch-contract-deployments',
    to: '/launch-arbitrum-chain/operate/post-launch-deployments',
  },
  {
    from: '/launch-arbitrum-chain/maintain-your-chain/guidance/state-growth',
    to: '/launch-arbitrum-chain/operate/state-growth',
  },
  {
    from: '/launch-arbitrum-chain/maintain-your-chain/monitoring-tools-and-considerations',
    to: '/launch-arbitrum-chain/operate/monitoring',
  },
  {
    from: '/launch-arbitrum-chain/maintain-your-chain/guidance/state-size-limit',
    to: '/launch-arbitrum-chain/operate/gas-target',
  },
  {
    from: '/launch-arbitrum-chain/maintain-your-chain/guidance/key-rotation',
    to: '/launch-arbitrum-chain/operate/key-rotation',
  },
  {
    from: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploy-your-first-rollup',
    to: '/launch-arbitrum-chain/quickstart/l3-rollup-from-scratch',
  },
  {
    from: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/run-testnet-infrastructure-first-rollup',
    to: '/launch-arbitrum-chain/quickstart/l3-rollup-testnet',
  },
  {
    from: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-an-arbitrum-chain',
    to: '/launch-arbitrum-chain/deploy/deploy-chain',
  },
  {
    from: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-token-bridge',
    to: '/launch-arbitrum-chain/deploy/token-bridge',
  },
  {
    from: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/canonical-factory-contracts',
    to: '/launch-arbitrum-chain/deploy/canonical-factory-contracts',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/advanced/config-sequencer-timing-adjustments',
    to: '/launch-arbitrum-chain/chain-configuration/sequencer/sequencer-timing-adjustments',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/advanced/da-api-integration-guide',
    to: '/launch-arbitrum-chain/integrations/da-api-guide',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/aep-fee-router-introduction',
    to: '/launch-arbitrum-chain/chain-config/costs/aep-overview',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/set-up-aep-fee-router',
    to: '/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/calculate-aep-fees',
    to: '/launch-arbitrum-chain/chain-config/costs/calculate-aep-fees',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/reporting-on-fees',
    to: '/launch-arbitrum-chain/chain-config/costs/reporting-on-fees',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/data-availability/config-data-availability',
    to: '/launch-arbitrum-chain/chain-config/data-availability/config-data-availability',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/get-started',
    to: '/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-das',
    to: '/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-mirror-das',
    to: '/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/configure-dac',
    to: '/launch-arbitrum-chain/chain-config/data-availability/configure-dac',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/dac-das-operations',
    to: '/launch-arbitrum-chain/chain-config/data-availability/dac-das-operations',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/das-rpc-method-reference',
    to: '/launch-arbitrum-chain/chain-config/data-availability/das-rpc-method-reference',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/enable-post-4844-blobs',
    to: '/launch-arbitrum-chain/chain-config/data-availability/enable-4844-blobs',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/fees/fee-management',
    to: '/launch-arbitrum-chain/chain-config/costs/fee-management',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/gas/use-a-custom-gas-token-anytrust',
    to: '/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/gas/use-a-custom-gas-token-rollup',
    to: '/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/gas/gas-optimization-tools',
    to: '/launch-arbitrum-chain/chain-config/costs/gas-optimization',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/gas/configure-native-mint-burn-gas-token',
    to: '/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/gas/dynamic-pricing-for-arbitrum-chains',
    to: '/launch-arbitrum-chain/chain-config/costs/dynamic-pricing',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/mev/timeboost-for-arbitrum-chains',
    to: '/launch-arbitrum-chain/chain-config/sequencer/timeboost',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/ux/fast-withdrawals',
    to: '/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
  },
  {
    from: '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/customizable-challenge-period',
    to: '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
  },
  // AUTO-GENERATED REDIRECTS END
];
