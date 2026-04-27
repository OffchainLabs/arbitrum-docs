import React, { useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  CommandBlock,
  SolidityLab,
  SolidityLabStep,
  TutorialChecklist,
  TutorialStep,
} from '@site/src/components/InteractiveTutorials';
import { vendingMachineSoliditySource } from '@site/src/resources/interactiveTutorialSources';

const REVIEW_TASKS = [
  {
    label: 'Find the two mappings that replace JavaScript object state.',
    lines: [5, 6] as [number, number],
    note: 'These are the contract-owned balances and cooldown timestamps.',
  },
  {
    label: 'Find the transaction function that changes contract storage.',
    lines: [8, 25] as [number, number],
    note: 'This is the state-changing path users call when they request a cupcake.',
  },
  {
    label: 'Find the view function that reads balance without a transaction.',
    lines: [27, 29] as [number, number],
    note: 'This read-only function returns the stored balance for an address.',
  },
];

const RUN_TASKS = [
  {
    label: 'Compile the contract in the browser.',
    lines: [1, 30] as [number, number],
    action: 'compile' as const,
    note: 'The lab compiles this single-file contract with solc-js and maps compiler messages back to source lines.',
  },
  {
    label: 'Confirm the selected compiler satisfies pragma ^0.8.9.',
    lines: [2, 2] as [number, number],
    action: 'focus' as const,
    note: 'Any Solidity 0.8.x compiler at or above 0.8.9 satisfies this pragma.',
  },
  {
    label: 'Connect a wallet on Arbitrum Sepolia.',
    action: 'connect' as const,
    note: 'The lab asks your injected wallet to switch to Arbitrum Sepolia before deployment.',
  },
  {
    label: 'Deploy the compiled contract.',
    lines: [4, 30] as [number, number],
    action: 'deploy' as const,
    note: 'Deployment uses the compiled ABI and bytecode from the editor content.',
  },
  {
    label: 'Call giveCupcakeTo with your connected address.',
    lines: [8, 25] as [number, number],
    action: 'write' as const,
    note: 'This sends a transaction that updates contract storage.',
  },
  {
    label: 'Read your cupcake balance.',
    lines: [27, 29] as [number, number],
    action: 'read' as const,
    note: 'This read-only call returns the stored balance without sending a transaction.',
  },
];

type ThemeName = 'light' | 'dark';

function ThemeFrame({ theme, children }: { theme: ThemeName; children: React.ReactNode }) {
  return (
    <div
      data-theme={theme}
      style={{
        flex: 1,
        minWidth: 0,
        padding: '1rem 1.25rem 1.5rem',
        background: 'var(--ifm-background-color)',
        color: 'var(--ifm-font-color-base)',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 8,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.75rem',
          color: 'var(--ifm-color-emphasis-700)',
        }}
      >
        {theme} mode
      </div>
      {children}
    </div>
  );
}

function FullTutorialBlock() {
  return (
    <article className="markdown" style={{ display: 'grid', gap: '1rem' }}>
      <TutorialChecklist
        title="Follow the lesson path"
        storageId="dev-solidity-lab-learning-path"
        items={[
          {
            title: 'Try the web2 vending machine',
            body: 'Use the on-page widget, then inspect the JavaScript state and rules.',
          },
          {
            title: 'Map JavaScript to Solidity',
            body: 'Use the walkthroughs to connect state variables, functions, transactions, and reads.',
          },
          {
            title: 'Compile in the lab',
            body: 'Turn the Solidity source into bytecode the EVM can execute.',
          },
          {
            title: 'Deploy and use it',
            body: 'Connect a wallet, deploy locally, then repeat on Arbitrum Sepolia.',
          },
        ]}
      />

      <TutorialStep
        id="review"
        title="Review the Javascript vending machine"
        checkpoint="You can identify which state and rules are controlled by the centralized JavaScript app."
      >
        <p>
          Body content for the review step. The IDE below is read-only-style: same component,
          different task list.
        </p>
      </TutorialStep>

      <SolidityLabStep
        id="inspect"
        title="Review the Solidity vending machine"
        checkpoint="You can explain which parts of the JavaScript app become contract storage, transactions, and free reads."
        lab={{
          title: 'Inspect VendingMachine.sol',
          source: vendingMachineSoliditySource,
          fileName: 'VendingMachine.sol',
          contractName: 'VendingMachine',
          height: 460,
          tasks: REVIEW_TASKS,
        }}
      >
        <p>
          The Solidity implementation declares two mappings, one transaction, and one view function.
        </p>
      </SolidityLabStep>

      <SolidityLabStep
        id="compile-and-deploy"
        title="Compile and deploy your smart contract"
        checkpoint="The on-page Solidity lab compiles, deploys, and calls VendingMachine."
        lab={{
          title: 'Compile and deploy VendingMachine.sol',
          source: vendingMachineSoliditySource,
          fileName: 'VendingMachine.sol',
          contractName: 'VendingMachine',
          height: 540,
          tasks: RUN_TASKS,
        }}
      >
        <p>Use the lab actions to compile, deploy, and call the contract end-to-end.</p>
      </SolidityLabStep>

      <CommandBlock
        title="Run a local chain"
        command="curl -L https://foundry.paradigm.xyz | bash && anvil"
        expectedOutput="...listening on 127.0.0.1:8545"
      />
    </article>
  );
}

function SoloLabBlock() {
  return (
    <SolidityLab
      title="Solidity lab"
      source={vendingMachineSoliditySource}
      fileName="VendingMachine.sol"
      contractName="VendingMachine"
      height={520}
      tasks={RUN_TASKS}
    />
  );
}

export default function DevSolidityLabPage() {
  const [view, setView] = useState<'side-by-side' | 'tutorial' | 'solo'>('side-by-side');

  return (
    <Layout
      {...({
        title: 'Solidity lab — dev preview',
        description: 'Visual diff for SolidityLab in both themes',
      } as Record<string, string>)}
    >
      <main style={{ padding: '1.5rem', maxWidth: 1480, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Solidity lab — dev preview</h1>
          <nav style={{ display: 'inline-flex', gap: '0.4rem' }}>
            {(['side-by-side', 'tutorial', 'solo'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                style={{
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: 6,
                  background:
                    option === view
                      ? 'var(--ifm-color-primary)'
                      : 'var(--ifm-background-surface-color)',
                  color:
                    option === view
                      ? 'var(--ifm-color-primary-contrast-background)'
                      : 'var(--ifm-font-color-base)',
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            ))}
          </nav>
        </header>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', fontSize: '0.85rem' }}>
          Isolated harness for the Solidity IDE. Side-by-side renders the lab in light + dark frames
          simultaneously. Use this page during iteration; it is not linked from any sidebar.
        </p>

        <BrowserOnly fallback={<div>Loading…</div>}>
          {() =>
            view === 'side-by-side' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(560px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <ThemeFrame theme="light">
                  <SoloLabBlock />
                </ThemeFrame>
                <ThemeFrame theme="dark">
                  <SoloLabBlock />
                </ThemeFrame>
              </div>
            ) : view === 'tutorial' ? (
              <div style={{ marginTop: '1rem' }}>
                <FullTutorialBlock />
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <SoloLabBlock />
              </div>
            )
          }
        </BrowserOnly>
      </main>
    </Layout>
  );
}
