import {
  type Address,
  type Chain,
  type EIP1193Provider,
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  defineTransactionRequest,
  numberToHex,
} from 'viem';
import { arbitrumSepolia } from 'viem/chains';

import { vendingMachineAbi } from './abi.ts';

export type VendingMachineMode = 'web2' | 'web3-localhost' | 'web3-arb-sepolia';

const LOCAL_DEVNET_CHAIN_IDS = new Set([31337, 1337, 412346]);

function walletChain(chain: Chain) {
  return defineChain({
    ...chain,
    formatters: {
      ...chain.formatters,
      // viem's default RPC formatter omits chainId. Keep it in the wallet request so the
      // validated network stays explicit even if the wallet changes after the last check.
      transactionRequest: defineTransactionRequest({
        format: () => ({ chainId: numberToHex(chain.id) }),
      }),
    },
  });
}

function demoChain(type: VendingMachineMode, chainId: number) {
  if (type === 'web3-arb-sepolia') {
    if (chainId !== arbitrumSepolia.id) {
      throw new Error(
        `Switch your wallet to Arbitrum Sepolia (chain ID ${arbitrumSepolia.id}) and try again. It is on chain ID ${chainId}.`,
      );
    }
    return arbitrumSepolia;
  }
  if (type !== 'web3-localhost' || !LOCAL_DEVNET_CHAIN_IDS.has(chainId)) {
    throw new Error(
      `Your wallet is on chain ID ${chainId}. Switch it to your local devnet (chain ID 31337 for the Anvil node this tutorial starts) and try again.`,
    );
  }
  return defineChain({
    id: chainId,
    name: `Local devnet (${chainId})`,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    // All requests use the injected wallet transport, including custom local RPC endpoints.
    rpcUrls: { default: { http: [] } },
    testnet: true,
  });
}

/** Connect, read the balance and submit a cupcake transaction on the validated demo chain. */
export async function requestCupcake({
  provider,
  type,
  account,
  contract,
}: {
  provider: EIP1193Provider;
  type: VendingMachineMode;
  account: Address;
  contract: Address;
}) {
  const publicClient = createPublicClient({ transport: custom(provider), pollingInterval: 1_000 });
  const connection = createWalletClient({ transport: custom(provider) });
  const [signer] = await connection.requestAddresses();
  if (!signer) throw new Error('No account selected in the wallet.');
  const chain = walletChain(demoChain(type, await connection.getChainId()));
  const walletClient = createWalletClient({ chain, transport: custom(provider) });

  const before = Number(
    await publicClient.readContract({
      address: contract,
      abi: vendingMachineAbi,
      functionName: 'getCupcakeBalanceFor',
      args: [account],
    }),
  );
  const hash = await walletClient.writeContract({
    account: signer,
    // A chain change during the read must fail viem's assertion before requesting a transaction.
    chain,
    address: contract,
    abi: vendingMachineAbi,
    functionName: 'giveCupcakeTo',
    args: [account],
  });
  return { publicClient, before, hash };
}
