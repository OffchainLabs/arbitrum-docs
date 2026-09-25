/**
 * ABI of the quickstart's `VendingMachine.sol`, transcribed from the compiled artifact that the
 * Docusaurus site imported as `VendingMachine.sol/VendingMachine.json`.
 *
 * Only the `abi` field was ever read; the artifact's bytecode is not used anywhere (readers deploy
 * the contract themselves from Remix). Declaring it as a TypeScript `as const` rather than a JSON
 * import is what lets viem infer argument and return types for each function.
 */
export const vendingMachineAbi = [
  {
    inputs: [{ internalType: 'address', name: 'userAddress', type: 'address' }],
    name: 'getCupcakeBalanceFor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'userAddress', type: 'address' }],
    name: 'giveCupcakeTo',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
