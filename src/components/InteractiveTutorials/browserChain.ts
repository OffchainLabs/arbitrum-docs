/**
 * Tiny in-memory simulator for the cupcake-style Solidity tutorial.
 * Not a real EVM — pattern-matches well-known ABI shapes so the IDE can
 * show a complete deploy → write → read flow in the browser without an
 * external RPC. Real EVM execution is a planned follow-up.
 */
import { ethers } from 'ethers';

type Balances = Map<string, bigint>;

type ContractState = {
  address: string;
  abi: ethers.utils.Fragment[];
  balances: Balances;
  cooldownsMs: Map<string, number>;
};

const COOLDOWN_MS = 5_000;

let nextNonce = 0;
const contracts = new Map<string, ContractState>();

function deterministicAddress(seed: string) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(seed));
  return ethers.utils.getAddress(`0x${hash.slice(-40)}`);
}

function pickReadFunctionName(fragments: ethers.utils.Fragment[]) {
  const fn = fragments.find(
    (f) =>
      f.type === 'function' &&
      'stateMutability' in f &&
      ((f as ethers.utils.FunctionFragment).stateMutability === 'view' ||
        (f as ethers.utils.FunctionFragment).stateMutability === 'pure'),
  ) as ethers.utils.FunctionFragment | undefined;
  return fn?.name;
}

function pickWriteFunctionName(fragments: ethers.utils.Fragment[]) {
  const fn = fragments.find(
    (f) =>
      f.type === 'function' &&
      'stateMutability' in f &&
      ((f as ethers.utils.FunctionFragment).stateMutability === 'nonpayable' ||
        (f as ethers.utils.FunctionFragment).stateMutability === 'payable'),
  ) as ethers.utils.FunctionFragment | undefined;
  return fn?.name;
}

export type DeployResult = {
  txHash: string;
  contractAddress: string;
};

export function browserDeploy(
  abi: ethers.ContractInterface,
  bytecode: string,
  deployer: string,
): DeployResult {
  const fragments = (Array.isArray(abi) ? abi : []) as ethers.utils.Fragment[];
  const seed = `${bytecode}-${deployer}-${nextNonce}`;
  const contractAddress = deterministicAddress(seed);
  contracts.set(contractAddress.toLowerCase(), {
    address: contractAddress,
    abi: fragments,
    balances: new Map(),
    cooldownsMs: new Map(),
  });
  nextNonce += 1;
  const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`deploy-${seed}`));
  return { txHash, contractAddress };
}

export type SendResult = {
  txHash: string;
  status: 0 | 1;
  revertReason?: string;
};

export function browserSend(
  contractAddress: string,
  abi: ethers.ContractInterface,
  fnName: string,
  args: unknown[],
  caller: string,
): SendResult {
  const state = contracts.get(contractAddress.toLowerCase());
  const txSeed = `${contractAddress}-${fnName}-${caller}-${Date.now()}`;
  const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(txSeed));
  if (!state) {
    return { txHash, status: 0, revertReason: 'Unknown contract' };
  }
  const fragments = (Array.isArray(abi) ? abi : []) as ethers.utils.Fragment[];
  state.abi = fragments;
  const writeFnName = pickWriteFunctionName(fragments);
  if (fnName !== writeFnName) {
    return {
      txHash,
      status: 0,
      revertReason: `Browser simulator only supports ${writeFnName ?? 'a state-changing call'}`,
    };
  }
  const target = (args[0] as string) || caller;
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
  contractAddress: string,
  abi: ethers.ContractInterface,
  fnName: string,
  args: unknown[],
): CallResult {
  const state = contracts.get(contractAddress.toLowerCase());
  if (!state) return { result: [], revertReason: 'Unknown contract' };
  const fragments = (Array.isArray(abi) ? abi : []) as ethers.utils.Fragment[];
  const readFnName = pickReadFunctionName(fragments);
  if (fnName !== readFnName) {
    return {
      result: [],
      revertReason: `Browser simulator only supports ${readFnName ?? 'a view call'}`,
    };
  }
  const target = (args[0] as string) || '0x';
  const balance = state.balances.get(target.toLowerCase()) ?? 0n;
  return { result: [balance] };
}

export function browserResetState() {
  contracts.clear();
  nextNonce = 0;
}
