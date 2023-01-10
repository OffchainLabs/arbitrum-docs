import React, { useEffect, useState } from "react";

type ChainID = 1 | 5 | 42170 | 421613 | 42161;

const chainIDToExplorerUrlRoot: {
  [chainId in ChainID]: string;
} = {
  1: "https://etherscan.io/address",
  5: "https://goerli.etherscan.io/address",
  42161: "https://arbiscan.io/address",
  42170: "https://nova.arbiscan.io/address",
  421613: "https://goerli.arbiscan.io/address",
};

export const AddressExplorerLink = (props: {
  address: string;
  chainID: ChainID;
}) => {
  const { address, chainID } = props;
  const rootUrl = chainIDToExplorerUrlRoot[chainID];
  // if(!rootUrl) throw new Error(`Error: no root url set for chain id ${chainID} `)
  return (
    <a href={`${rootUrl}/${address}`} target="_blank">
      {address}
    </a>
  );
};
