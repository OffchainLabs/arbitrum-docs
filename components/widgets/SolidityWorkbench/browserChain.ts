/**
 * Tiny in-memory simulator for the cupcake-style Solidity tutorial.
 * Not a real EVM — pattern-matches well-known ABI shapes so the IDE can
 * show a complete deploy → write → read flow in the browser without an
 * external RPC.
 *
 * Import-free apart from viem, so `scripts/solidity-workbench-browser-chain.test.ts` imports it
 * under `node --test`.
 */
import { type Abi, type Address, type Hex, getAddress, keccak256, toBytes } from 'viem';

/**
 * Account #0 of the local devnet test mnemonic
 * (`test test test test test test test test test test test junk`), the account Anvil and Hardhat
 * fund by default. The simulator sends every call from it.
 */
export const BROWSER_ACCOUNT: Address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

type ContractState = {
  address: Address;
  abi: Abi;
  balances: Map<string, bigint>;
  cooldownsMs: Map<string, number>;
};

const COOLDOWN_MS = 5_000;

let nextNonce = 0;
const contracts = new Map<string, ContractState>();

function hashText(text: string): Hex {
  return keccak256(toBytes(text));
}

function deterministicAddress(seed: string): Address {
  return getAddress(`0x${hashText(seed).slice(-40)}`);
}

/** The first `nonpayable` or `payable` function in the ABI: the call that changes state. */
export function writeFunctionName(abi: Abi): string | undefined {
  const fn = abi.find(
    (item) =>
      item.type === 'function' &&
      (item.stateMutability === 'nonpayable' || item.stateMutability === 'payable'),
  );
  return fn?.type === 'function' ? fn.name : undefined;
}

/** The first `view` or `pure` function in the ABI: the call that reads state. */
export function readFunctionName(abi: Abi): string | undefined {
  const fn = abi.find(
    (item) =>
      item.type === 'function' &&
      (item.stateMutability === 'view' || item.stateMutability === 'pure'),
  );
  return fn?.type === 'function' ? fn.name : undefined;
}

export type DeployResult = {
  txHash: Hex;
  contractAddress: Address;
};

export function browserDeploy(abi: Abi, bytecode: Hex, deployer: Address): DeployResult {
  const seed = `${bytecode}-${deployer}-${nextNonce}`;
  const contractAddress = deterministicAddress(seed);
  contracts.set(contractAddress.toLowerCase(), {
    address: contractAddress,
    abi,
    balances: new Map(),
    cooldownsMs: new Map(),
  });
  nextNonce += 1;
  return { txHash: hashText(`deploy-${seed}`), contractAddress };
}

export type SendResult = {
  txHash: Hex;
  status: 0 | 1;
  revertReason?: string;
};

export function browserSend(
  contractAddress: Address,
  abi: Abi,
  fnName: string,
  args: readonly unknown[],
  caller: Address,
): SendResult {
  const state = contracts.get(contractAddress.toLowerCase());
  const txHash = hashText(`${contractAddress}-${fnName}-${caller}-${Date.now()}`);
  if (!state) {
    return { txHash, status: 0, revertReason: 'Unknown contract' };
  }
  state.abi = abi;
  const writeFnName = writeFunctionName(abi);
  if (fnName !== writeFnName) {
    return {
      txHash,
      status: 0,
      revertReason: `Browser simulator only supports ${writeFnName ?? 'a state-changing call'}`,
    };
  }
  const target = (args[0] as string | undefined) || caller;
  const targetKey = target.toLowerCase();
  const last = state.cooldownsMs.get(targetKey) ?? 0;
  const now = Date.now();
  if (now - last < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
    return {
      txHash,
      status: 0,
      revertReason: `Cooldown: wait ${remaining}s before another cupcake`,
    };
  }
  state.balances.set(targetKey, (state.balances.get(targetKey) ?? 0n) + 1n);
  state.cooldownsMs.set(targetKey, now);
  return { txHash, status: 1 };
}

export type CallResult = {
  result: unknown[];
  revertReason?: string;
};

export function browserCall(
  contractAddress: Address,
  abi: Abi,
  fnName: string,
  args: readonly unknown[],
): CallResult {
  const state = contracts.get(contractAddress.toLowerCase());
  if (!state) return { result: [], revertReason: 'Unknown contract' };
  const readFnName = readFunctionName(abi);
  if (fnName !== readFnName) {
    return {
      result: [],
      revertReason: `Browser simulator only supports ${readFnName ?? 'a view call'}`,
    };
  }
  const target = (args[0] as string | undefined) || '0x';
  const balance = state.balances.get(target.toLowerCase()) ?? 0n;
  return { result: [balance] };
}

export function browserResetState() {
  contracts.clear();
  nextNonce = 0;
}
