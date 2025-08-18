import React from 'react';

interface AddressExplorerLinkProps {
  address: string;
  chain?: string;
  chainID?: number;
  children?: React.ReactNode;
  className?: string;
}

export function AddressExplorerLink({ address, chain, chainID, children, className }: AddressExplorerLinkProps) {
  const getChainFromID = (chainID: number): string => {
    switch (chainID) {
      case 1:
        return 'ethereum';
      case 42161:
        return 'arbitrum-one';
      case 42170:
        return 'arbitrum-nova';
      case 8453:
        return 'base';
      case 11155111:
        return 'sepolia';
      case 421614:
        return 'arbitrum-sepolia';
      case 84532:
        return 'base-sepolia';
      default:
        return 'ethereum';
    }
  };

  const getExplorerUrl = (address: string, chain: string) => {
    switch (chain.toLowerCase()) {
      case 'arbitrum':
      case 'arbitrum-one':
        return `https://arbiscan.io/address/${address}`;
      case 'arbitrum-nova':
        return `https://nova.arbiscan.io/address/${address}`;
      case 'arbitrum-sepolia':
        return `https://sepolia.arbiscan.io/address/${address}`;
      case 'base':
        return `https://basescan.org/address/${address}`;
      case 'base-sepolia':
        return `https://sepolia.basescan.org/address/${address}`;
      case 'sepolia':
        return `https://sepolia.etherscan.io/address/${address}`;
      case 'ethereum':
      case 'mainnet':
      default:
        return `https://etherscan.io/address/${address}`;
    }
  };

  const resolvedChain = chain || (chainID ? getChainFromID(chainID) : 'ethereum');

  return (
    <a 
      href={getExplorerUrl(address, resolvedChain)} 
      target="_blank" 
      rel="noopener noreferrer"
      className={className}
    >
      {children || address}
    </a>
  );
}

export default AddressExplorerLink;