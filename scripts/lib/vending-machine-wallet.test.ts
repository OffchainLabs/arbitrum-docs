import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EIP1193Provider } from 'viem';

import {
  type VendingMachineMode,
  requestCupcake,
} from '../../components/widgets/VendingMachine/wallet.ts';

const account = '0x1111111111111111111111111111111111111111';
const contract = '0x2222222222222222222222222222222222222222';
const hash = `0x${'a'.repeat(64)}`;

function fakeWallet(initialChainId: number, nextChainId = initialChainId) {
  let chainId = initialChainId;
  const transactions: Record<string, unknown>[] = [];
  const methods: string[] = [];
  const provider = {
    async request({ method, params }: { method: string; params?: readonly unknown[] }) {
      methods.push(method);
      if (method === 'eth_requestAccounts') return [account];
      if (method === 'eth_chainId') return `0x${chainId.toString(16)}`;
      if (method === 'eth_call') {
        chainId = nextChainId;
        return `0x${'0'.repeat(63)}2`;
      }
      if (method === 'eth_sendTransaction' || method === 'wallet_sendTransaction') {
        transactions.push(params?.[0] as Record<string, unknown>);
        return hash;
      }
      throw new Error(`Unexpected wallet request: ${method}`);
    },
  } as EIP1193Provider;
  return { provider, transactions, methods };
}

describe('vending machine wallet transaction', () => {
  for (const [type, chainId] of [
    ['web3-arb-sepolia', 421614],
    ['web3-localhost', 31337],
    ['web3-localhost', 1337],
    ['web3-localhost', 412346],
  ] as const) {
    it(`submits on the selected ${type} chain ${chainId} with an explicit chain ID`, async () => {
      const wallet = fakeWallet(chainId);
      const result = await requestCupcake({ provider: wallet.provider, type, account, contract });
      assert.equal(result.before, 2);
      assert.equal(result.hash, hash);
      assert.equal(wallet.transactions.length, 1);
      assert.equal(wallet.transactions[0].chainId, `0x${chainId.toString(16)}`);
      assert.equal(wallet.transactions[0].to, contract);
      assert.equal(wallet.transactions[0].from, account);
    });

    it(`refuses a mainnet switch during the ${type} balance read on ${chainId}`, async () => {
      const wallet = fakeWallet(chainId, 1);
      await assert.rejects(
        requestCupcake({ provider: wallet.provider, type, account, contract }),
        /does not match the target chain/,
      );
      assert.ok(wallet.methods.includes('eth_call'));
      assert.equal(wallet.transactions.length, 0);
    });
  }

  for (const [type, chainId] of [
    ['web3-arb-sepolia', 1],
    ['web3-arb-sepolia', 31337],
    ['web3-localhost', 42161],
    ['web3-localhost', 421614],
    ['web2', 31337],
  ] as const satisfies readonly (readonly [VendingMachineMode, number])[]) {
    it(`rejects unsupported chain ${chainId} for ${type} before reading or sending`, async () => {
      const wallet = fakeWallet(chainId);
      await assert.rejects(
        requestCupcake({ provider: wallet.provider, type, account, contract }),
        /Switch (your wallet|it) to/,
      );
      assert.ok(!wallet.methods.includes('eth_call'));
      assert.equal(wallet.transactions.length, 0);
    });
  }
});
