/**
 * ABI of the quickstart's `VendingMachine.sol`.
 *
 * No bytecode is needed, because readers deploy the contract themselves from Remix. Declaring the
 * ABI `as const` is what lets viem infer argument and return types for each function.
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
