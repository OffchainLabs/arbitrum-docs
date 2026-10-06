import { getAddress, isAddress } from '@ethersproject/address';

type ChainID = 1 | 42161 | 42170 | 8453 | 11155111 | 421614 | 84532;

const chainIDToExplorerUrlRoot: { [chainId in ChainID]: string } = {
  1: 'https://etherscan.io/address',
  42161: 'https://arbiscan.io/address',
  42170: 'https://nova.arbiscan.io/address',
  8453: 'https://basescan.org/address',
  11155111: 'https://sepolia.etherscan.io/address',
  421614: 'https://sepolia.arbiscan.io/address',
  84532: 'https://sepolia.basescan.org/address',
};

interface Props {
  address: string;
  chainID: ChainID;
  shortenAddress?: boolean;
}

export const AddressExplorerLink = ({ address, chainID, shortenAddress }: Props) => {
  const rootUrl = chainIDToExplorerUrlRoot[chainID];
  if (!rootUrl) throw new Error(`Error: no root url set for chain id ${chainID}`);
  if (!isAddress(address)) throw new Error(`Error: ${address} is not an address`);
  const checksummed = getAddress(address);
  if (checksummed !== address) {
    throw new Error(`Error: ${address} has invalid checksum; should be ${checksummed}`);
  }
  const addressLabel = shortenAddress ? address.slice(0, 6) + '...' + address.slice(-4) : address;
  return (
    <a href={`${rootUrl}/${address}`} target="_blank" rel="noopener noreferrer">
      {addressLabel}
    </a>
  );
};
