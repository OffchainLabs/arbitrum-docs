import { BaseError, type WalletClient } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

/** EIP-1193 error code a wallet returns from `wallet_switchEthereumChain` for an unknown chain. */
const UNRECOGNIZED_CHAIN = 4902;

function isUnrecognizedChain(error: unknown) {
  return (
    error instanceof BaseError &&
    Boolean(error.walk((cause) => (cause as { code?: unknown }).code === UNRECOGNIZED_CHAIN))
  );
}

/** Switches the wallet to Arbitrum Sepolia, and adds the network first if the wallet lacks it. */
export async function ensureArbitrumSepolia(wallet: WalletClient) {
  try {
    await wallet.switchChain({ id: arbitrumSepolia.id });
  } catch (error) {
    if (!isUnrecognizedChain(error)) throw error;
    await wallet.addChain({ chain: arbitrumSepolia });
  }
}
