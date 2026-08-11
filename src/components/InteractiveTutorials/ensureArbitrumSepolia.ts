import { ethers } from 'ethers';

import { ARBITRUM_SEPOLIA } from './SolidityLabSupport';

export async function ensureArbitrumSepolia(ethereum: ethers.Eip1193Provider) {
  if (typeof ethereum.request !== 'function') return;
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARBITRUM_SEPOLIA.chainIdHex }],
    });
  } catch (error) {
    const switchError = error as { code?: number };
    if (switchError.code !== 4902) throw error;
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: ARBITRUM_SEPOLIA.chainIdHex,
          chainName: ARBITRUM_SEPOLIA.chainName,
          rpcUrls: ARBITRUM_SEPOLIA.rpcUrls,
          blockExplorerUrls: ARBITRUM_SEPOLIA.blockExplorerUrls,
          nativeCurrency: ARBITRUM_SEPOLIA.nativeCurrency,
        },
      ],
    });
  }
}
