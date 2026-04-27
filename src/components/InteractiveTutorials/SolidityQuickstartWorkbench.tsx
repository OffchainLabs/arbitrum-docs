import React from 'react';
import { vendingMachineSoliditySource } from '@site/src/resources/interactiveTutorialSources';
import { SolidityLab, SolidityLabTask } from './SolidityLab';
import styles from './styles.module.css';

const quickstartTasks: SolidityLabTask[] = [
  {
    label: 'A Solidity contract becomes on-chain activity.',
    spotlight: 'lesson',
    note: 'A Solidity file becomes a blockchain program through a small set of concrete steps.',
    bullets: [
      'Contract source contains the state and functions.',
      'Compilation produces EVM bytecode and an ABI.',
      'Deployment creates a contract address on a selected network.',
      'Contract calls and explorer records show how transactions change state.',
    ],
  },
  {
    label: 'Contract state lives in storage.',
    lines: [5, 6],
    spotlight: 'lines',
    note: 'A blockchain app stores important state inside the smart contract, not in a private server database.',
    bullets: [
      'The two mappings are persistent contract storage.',
      'Successful transactions can update these values.',
      'Anyone can later verify the resulting state from the chain.',
    ],
  },
  {
    label: 'Transactions change contract storage.',
    lines: [8, 25],
    spotlight: 'lines',
    note: 'Functions that change contract storage must be sent as transactions.',
    bullets: [
      'It checks whether the caller has waited long enough.',
      'It increments the cupcake balance and records a new timestamp.',
      'It can revert, which means the attempted state change is rejected.',
    ],
  },
  {
    label: 'Compile source into bytecode.',
    lines: [1, 30],
    action: 'compile',
    spotlight: 'lesson',
    placement: 'left',
    note: 'The chain does not run Solidity source directly. Compilation turns this file into deployable machine-readable output.',
    bullets: [
      'EVM bytecode is the payload that can be deployed to a network.',
      'The ABI tells tools which functions the contract exposes and how to call them.',
      'The console records the compiler output so the technical result stays inspectable.',
    ],
  },
  {
    label: 'Create a contract on the network.',
    lines: [4, 30],
    action: 'deploy',
    spotlight: 'lesson',
    placement: 'left',
    note: 'Deployment is the first transaction for this contract. It creates the on-chain address that later calls will target.',
    bullets: [
      'The selected network receives the compiled bytecode.',
      'A contract address is created when the deployment transaction succeeds.',
      'The block explorer records the deployment as contract creation history.',
    ],
  },
  {
    label: 'Send a state-changing transaction.',
    lines: [8, 25],
    action: 'write',
    spotlight: 'write',
    placement: 'left',
    note: 'Calling the write function creates another transaction because this call changes contract storage.',
    bullets: [
      'The sender is the connected wallet.',
      'The destination is the deployed contract address.',
      'The method name and status appear in the explorer transaction row.',
    ],
  },
  {
    label: 'Read state without a transaction.',
    lines: [27, 29],
    action: 'read',
    spotlight: 'read',
    placement: 'left',
    note: 'Read calls ask a node to evaluate a view function against the latest state.',
    bullets: [
      'They do not modify contract storage.',
      'They do not need mining and do not create a transaction row.',
      'The returned balance changed only because the previous write transaction succeeded.',
    ],
  },
  {
    label: 'Inspect what happened on-chain.',
    spotlight: 'runtime',
    placement: 'left',
    note: 'A block explorer organizes blockchain activity into current state and historical events.',
    bullets: [
      'Connected Wallet shows the active wallet, deployed contract, and readable balance.',
      'Transactions shows the deploy and write history.',
      'Expanding a transaction reveals the hash, sender, destination, action, and status.',
    ],
  },
];

function QuickstartSidebar() {
  return (
    <div>
      <span className={styles.ideActionHeading}>Lesson</span>
    </div>
  );
}

export function SolidityQuickstartWorkbench() {
  return (
    <SolidityLab
      title="Solidity quickstart"
      source={vendingMachineSoliditySource}
      fileName="VendingMachine.sol"
      contractName="VendingMachine"
      height={620}
      tasks={quickstartTasks}
      sidebarIntro={<QuickstartSidebar />}
      useSpotlight
    />
  );
}
