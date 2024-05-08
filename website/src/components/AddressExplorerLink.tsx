import React from 'react';
import { getAddress, isAddress } from '@ethersproject/address';

type ChainID = 1 | 11155111 | 42170 | 42161 | 421614 | 13331371 | 23011913;

const chainIDToExplorerUrlRoot: {
  [chainId in ChainID]: string;
} = {
  1: 'https://etherscan.io/address',
  11155111: 'https://sepolia.etherscan.io/address',
  42161: 'https://arbiscan.io/address',
  42170: 'https://nova.arbiscan.io/address',
  421614: 'https://sepolia.arbiscan.io/address',
  13331371: 'https://stylusv2-explorer.arbitrum.io/address',
  23011913: 'https://stylus-testnet-explorer.arbitrum.io/address',
};

export const AddressExplorerLink = (props: {
  address: string;
  chainID: ChainID;
  shortenAddress?: boolean;
}) => {
  const { address, chainID, shortenAddress } = props;
  const rootUrl = chainIDToExplorerUrlRoot[chainID];
  if (!rootUrl) throw new Error(`Error: no root url set for chain id ${chainID} `);
  if (!isAddress(address)) throw new Error(`Error ${address} is not an address`);
  if (getAddress(address) != address)
    throw new Error(`Error: ${address} has invalid checksum; should be ${getAddress(address)}`);

  const addressLabel = shortenAddress ? address.slice(0, 6) + '...' + address.slice(-4) : address;

  return (
    <a href={`${rootUrl}/${address}`} target="_blank">
      {addressLabel}
    </a>
  );
};
