/**
 * Addresses that `@arbitrum/sdk` does NOT expose, consumed by
 * `scripts/generate-contract-addresses.ts` to build the contract-address
 * reference partial.
 *
 * Everything the SDK DOES expose is read live from it (rollup, inbox,
 * sequencerInbox, bridge, outbox, classic outboxes, and the full token
 * bridge: gateways, WETH, proxy admins, multicall). Do NOT duplicate those
 * here — they would drift.
 *
 * The values below are maintained by hand. Re-verify them after protocol
 * upgrades: BoLD and similar upgrades redeploy the rollup and fraud-proof
 * contracts, and the SDK is the source of truth for the rollup address while
 * these fraud-proof addresses are not. Precompile addresses are protocol
 * constants and effectively never change.
 */

export type ChainKey = 'arbOne' | 'nova' | 'sepolia';

/** Core proxy admin — deployed on the parent chain (L1). */
export const coreProxyAdmin: Record<ChainKey, string> = {
  arbOne: '0x554723262467F125Ac9e1cDFa9Ce15cc53822dbD',
  nova: '0x71D78dC7cCC0e037e12de1E50f5470903ce37148',
  sepolia: '0x1ed74a4e4F4C42b86A7002e9951e98DBcC890686',
};

/** Fraud-proof contracts — deployed on the parent chain (L1). */
export const fraudProof: Record<string, Record<ChainKey, string>> = {
  ChallengeManager: {
    arbOne: '0xA5565d266c3c3Ee90B16Be8A5b13d587ef559fB0',
    nova: '0xFE66b18Ef1B943F8594A2710376Af4B01AcfA688',
    sepolia: '0xC60b56Ff6aAb3FE8B9Bd70040Fe9E95A26258B4C',
  },
  OneStepProver0: {
    arbOne: '0x35FBC5F03d86E88973B06Fb9C5a913D54AbdF731',
    nova: '0x35FBC5F03d86E88973B06Fb9C5a913D54AbdF731',
    sepolia: '0x3Fe73F959C44e04d660dBFBbeffd51FD2c091377',
  },
  OneStepProverMemory: {
    arbOne: '0xe0ba77e0E24de5369e3B268Ea79fDe716e2EC48b',
    nova: '0xe0ba77e0E24de5369e3B268Ea79fDe716e2EC48b',
    sepolia: '0x6268Fc8dB1b5083b405b2C51808Df3619783ec2d',
  },
  OneStepProverMath: {
    arbOne: '0xaB9596a0aaF28bc798c453434EC2DC0F8F0bF921',
    nova: '0xaB9596a0aaF28bc798c453434EC2DC0F8F0bF921',
    sepolia: '0x42f58c90583eC3fA0E0b724dEDF755AE1068e8Fa',
  },
  OneStepProverHostIo: {
    arbOne: '0xa07cD154340CC74EcF156FFB9fb378Ee29Ca71Cf',
    nova: '0xa07cD154340CC74EcF156FFB9fb378Ee29Ca71Cf',
    sepolia: '0xdB2c541e20Bd1830c8a050341Fca0Af51489C165',
  },
  OneStepProofEntry: {
    arbOne: '0x4397fE1E959Ba81B9D5f1A9679Ddd891955A42d6',
    nova: '0x4397fE1E959Ba81B9D5f1A9679Ddd891955A42d6',
    sepolia: '0xB9cf664A1beD8F74f4B893a18c86eCe876CdAE80',
  },
};

/** Resource constraint manager — deployed on the child chain (L2). */
export const resourceConstraintManager: Partial<Record<ChainKey, string>> = {
  arbOne: '0x8F59C7A53b883563B34cbBb6fF021B03973e823a',
  nova: '0x653e31e11769a9c6feE825E4BC822753DE2286B7',
};

/** Canonical factory contracts — deployed on the child chain (L2). */
export const factories: Record<string, Record<ChainKey, string>> = {
  RollupCreator: {
    arbOne: '0xB90e53fd945Cd28Ec4728cBfB566981dD571eB8b',
    nova: '0xF916Bfe431B7A7AaE083273F5b862e00a15d60F4',
    sepolia: '0x5F45675AC8DDF7d45713b2c7D191B287475C16cF',
  },
  TokenBridgeCreator: {
    arbOne: '0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e',
    nova: '0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14',
    sepolia: '0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E',
  },
};

/**
 * Precompiles — protocol constants deployed at the same address on every
 * Arbitrum chain. Order here is the order rendered in the table.
 */
export const precompiles: Array<[name: string, address: string]> = [
  ['ArbAddressTable', '0x0000000000000000000000000000000000000066'],
  ['ArbAggregator', '0x000000000000000000000000000000000000006D'],
  ['ArbFunctionTable', '0x0000000000000000000000000000000000000068'],
  ['ArbGasInfo', '0x000000000000000000000000000000000000006C'],
  ['ArbInfo', '0x0000000000000000000000000000000000000065'],
  ['ArbOwner', '0x0000000000000000000000000000000000000070'],
  ['ArbOwnerPublic', '0x000000000000000000000000000000000000006B'],
  ['ArbRetryableTx', '0x000000000000000000000000000000000000006E'],
  ['ArbStatistics', '0x000000000000000000000000000000000000006F'],
  ['ArbSys', '0x0000000000000000000000000000000000000064'],
  ['ArbWasm', '0x0000000000000000000000000000000000000071'],
  ['ArbWasmCache', '0x0000000000000000000000000000000000000072'],
  ['NodeInterface', '0x00000000000000000000000000000000000000C8'],
];
