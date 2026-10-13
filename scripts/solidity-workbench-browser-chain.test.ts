import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { isAddress } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';

import {
  BROWSER_ACCOUNT,
  browserCall,
  browserDeploy,
  browserResetState,
  browserSend,
} from '../components/widgets/SolidityWorkbench/browserChain.ts';
import { vendingMachineAbi } from '../components/widgets/VendingMachine/abi.ts';

const BYTECODE = '0x6080604052';
const OTHER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

beforeEach(() => {
  browserResetState();
});

test('the browser account is account #0 of the local devnet test mnemonic', () => {
  const account = mnemonicToAccount('test test test test test test test test test test test junk');
  assert.equal(BROWSER_ACCOUNT, account.address);
});

test('deploy returns a checksummed contract address and a transaction hash', () => {
  const { contractAddress, txHash } = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  assert.ok(isAddress(contractAddress, { strict: true }));
  assert.match(txHash, /^0x[0-9a-f]{64}$/);
});

test('a new contract reads a zero balance', () => {
  const { contractAddress } = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  const read = browserCall(contractAddress, vendingMachineAbi, 'getCupcakeBalanceFor', [
    BROWSER_ACCOUNT,
  ]);
  assert.deepEqual(read, { result: [0n] });
});

test('a successful write increases the balance that a read returns', () => {
  const { contractAddress } = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  const sent = browserSend(
    contractAddress,
    vendingMachineAbi,
    'giveCupcakeTo',
    [BROWSER_ACCOUNT],
    BROWSER_ACCOUNT,
  );
  assert.equal(sent.status, 1);
  assert.equal(sent.revertReason, undefined);
  const mine = browserCall(contractAddress, vendingMachineAbi, 'getCupcakeBalanceFor', [
    BROWSER_ACCOUNT.toLowerCase(),
  ]);
  assert.deepEqual(mine.result, [1n]);
  const theirs = browserCall(contractAddress, vendingMachineAbi, 'getCupcakeBalanceFor', [OTHER]);
  assert.deepEqual(theirs.result, [0n]);
});

test('a second write inside the 5-second cooldown reverts and leaves the balance unchanged', () => {
  const { contractAddress } = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  const args = [BROWSER_ACCOUNT] as const;
  browserSend(contractAddress, vendingMachineAbi, 'giveCupcakeTo', args, BROWSER_ACCOUNT);
  const second = browserSend(
    contractAddress,
    vendingMachineAbi,
    'giveCupcakeTo',
    args,
    BROWSER_ACCOUNT,
  );
  assert.equal(second.status, 0);
  assert.match(second.revertReason ?? '', /^Cooldown: wait [1-5]s before another cupcake$/);
  const read = browserCall(contractAddress, vendingMachineAbi, 'getCupcakeBalanceFor', args);
  assert.deepEqual(read.result, [1n]);
});

test('a write to another function or to an unknown contract reverts', () => {
  const { contractAddress } = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  const wrongFunction = browserSend(
    contractAddress,
    vendingMachineAbi,
    'getCupcakeBalanceFor',
    [BROWSER_ACCOUNT],
    BROWSER_ACCOUNT,
  );
  assert.equal(wrongFunction.status, 0);
  assert.equal(wrongFunction.revertReason, 'Browser simulator only supports giveCupcakeTo');
  const unknown = browserSend(OTHER, vendingMachineAbi, 'giveCupcakeTo', [], BROWSER_ACCOUNT);
  assert.deepEqual([unknown.status, unknown.revertReason], [0, 'Unknown contract']);
});

test('a read of another function reports the view call the simulator supports', () => {
  const { contractAddress } = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  const read = browserCall(contractAddress, vendingMachineAbi, 'giveCupcakeTo', [BROWSER_ACCOUNT]);
  assert.deepEqual(read, {
    result: [],
    revertReason: 'Browser simulator only supports getCupcakeBalanceFor',
  });
});

test('reset forgets deployed contracts and restarts address derivation', () => {
  const first = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  const second = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  assert.notEqual(first.contractAddress, second.contractAddress);

  browserResetState();

  const read = browserCall(first.contractAddress, vendingMachineAbi, 'getCupcakeBalanceFor', [
    BROWSER_ACCOUNT,
  ]);
  assert.deepEqual(read, { result: [], revertReason: 'Unknown contract' });
  const again = browserDeploy(vendingMachineAbi, BYTECODE, BROWSER_ACCOUNT);
  assert.equal(again.contractAddress, first.contractAddress);
});
