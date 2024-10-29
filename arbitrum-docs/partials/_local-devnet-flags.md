<section class="small-table">
  | Flag | Description |
  |-------------------------------|------------------------------------------------------------------------------------------------------|
  | `--init` | Removes all the data, rebuilds, and deploys a new rollup | | `--pos` | L1 is a
  proof-of-stake chain (using Prysm for consensus) | | `--validate` | Validates all blocks in WASM,
  heavy computation | | `--l3node` | Deploys an L3 node on top of the L2 | | `--l3-fee-token` | Sets
  up the L3 chain to use a custom fee token. Only valid if `--l3node` flag is provided | |
  `--l3-fee-token-decimals` | Number of decimals to use for a custom fee token. Only valid if
  `--l3-fee-token` flag is provided | | `--l3-token-bridge` | Deploys an L2-L3 token bridge. Only
  valid if `--l3node` flag is provided | | `--batchposters` | Batch posters [0-3] | |
  `--redundantsequencers` | Redundant sequencers [0-3] | | `--detach` | Detaches from nodes after
  running them | | `--blockscout` | Builds or launches the Blockscout | | `--simple` | Runs a simple
  configuration: one node as a sequencer/batch-poster/staker (default unless using `--dev`) | |
  `--tokenbridge` | Deploy an L1-L2 token bridge | | `--no-tokenbridge` | Opt out of building or
  launching the token bridge | | `--no-run` | Does not launch nodes (useful with build or init) | |
  `--no-simple` | Runs a full configuration with separate sequencer/batch-poster/validator/relayer |
</section>
