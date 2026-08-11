import React, { ReactNode } from 'react';
import { ethers } from 'ethers';
import { Language } from 'prism-react-renderer';
import { Step, TooltipRenderProps } from 'react-joyride';
import layoutStyles from './SolidityLabLayout.module.css';
import panelStyles from './SolidityLabPanels.module.css';

const styles = { ...layoutStyles, ...panelStyles };

const LOCAL_DEVNET_MNEMONIC = 'test test test test test test test test test test test junk';

type DevAccount = {
  address: string;
  privateKey: string;
};

export function deriveLocalDevnetAccounts(count: number): DevAccount[] {
  const wallets: DevAccount[] = [];
  for (let i = 0; i < count; i++) {
    const wallet = ethers.HDNodeWallet.fromPhrase(
      LOCAL_DEVNET_MNEMONIC,
      undefined,
      `m/44'/60'/0'/0/${i}`,
    );
    wallets.push({ address: wallet.address, privateKey: wallet.privateKey });
  }
  return wallets;
}

export function pickFunctionName(
  abi: ethers.InterfaceAbi,
  matcher: (fragment: ethers.FunctionFragment) => boolean,
) {
  const fragments = (Array.isArray(abi) ? abi : []) as ethers.Fragment[];
  const fn = fragments.find(
    (f) => f.type === 'function' && matcher(f as ethers.FunctionFragment),
  ) as ethers.FunctionFragment | undefined;
  return fn?.name;
}

export type LabAction = 'focus' | 'compile' | 'connect' | 'deploy' | 'write' | 'read';
export type SpotlightTarget =
  | 'lesson'
  | 'demo'
  | 'editor'
  | 'lines'
  | 'network'
  | 'account'
  | 'compile'
  | 'connect'
  | 'deploy'
  | 'write'
  | 'read'
  | 'runtime'
  | 'status'
  | 'next';
export type LineRange = [number, number];

export type SolidityLabTask = {
  label: string;
  lines?: LineRange;
  note?: string;
  bullets?: string[];
  action?: LabAction;
  spotlight?: SpotlightTarget;
  placement?: Step['placement'];
};

export type CompilationIssue = {
  severity?: string;
  message: string;
  line?: number;
};

export type CompilationResult = {
  abi: ethers.InterfaceAbi;
  bytecode: string;
  contractName: string;
};

export type ConsoleKind = 'info' | 'success' | 'error';

export type LabConsoleEntry = {
  id: number;
  kind: ConsoleKind;
  source: string;
  message: string;
};

export type ExplorerTransaction = {
  id: number;
  hash: string;
  method: string;
  from: string;
  to?: string;
  status: 'Success' | 'Reverted';
  network: LabMode;
  link?: string;
};

export type SolidityLabProps = {
  title?: string;
  description?: string;
  source: string;
  fileName?: string;
  contractName: string;
  height?: number;
  tasks?: SolidityLabTask[];
  sidebarIntro?: ReactNode;
  useSpotlight?: boolean;
};

export const ARBITRUM_SEPOLIA = {
  chainId: 421614,
  chainIdHex: '0x66eee',
  chainName: 'Arbitrum Sepolia',
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const LOCAL_DEVNET_ACCOUNT_COUNT = 5;
export const COMPILE_INSTRUCTION_MS = 4200;
export const DEPLOY_INSTRUCTION_MS = 4800;

const SOLC_BINARIES_URL = 'https://binaries.soliditylang.org/bin';
export const SOLC_VERSION = '0.8.34';
const COMPILER_WORKER_SOURCE = `
let compilerPromise;

async function loadCompiler(version, binariesUrl) {
  if (!compilerPromise) {
    compilerPromise = (async () => {
      const listResponse = await fetch(binariesUrl + '/list.json');
      const list = await listResponse.json();
      const latestPath = list.latestRelease ? list.releases[list.latestRelease] : undefined;
      const compilerPath = list.releases[version] || latestPath;
      if (!compilerPath) throw new Error('Unable to resolve a Solidity compiler build.');
      const compilerResponse = await fetch(binariesUrl + '/' + compilerPath);
      const compilerScript = await compilerResponse.text();
      const load = new Function(compilerScript + '; return Module;');
      return load();
    })();
  }
  return compilerPromise;
}

self.onmessage = async (event) => {
  const { id, input, version, binariesUrl } = event.data;
  try {
    const soljson = await loadCompiler(version, binariesUrl);
    const compile = soljson.cwrap('solidity_compile', 'string', ['string', 'number', 'number']);
    self.postMessage({ id, output: compile(input, 0, 0) });
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};
`;

export function shortAddress(address?: string) {
  if (!address) return '—';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getIssueLine(source: string, sourceLocation?: { start?: number }) {
  if (!sourceLocation || typeof sourceLocation.start !== 'number' || sourceLocation.start < 0) {
    return undefined;
  }
  return source.slice(0, sourceLocation.start).split('\n').length;
}

export function isLineActive(lineNumber: number, range?: LineRange) {
  return Boolean(range && lineNumber >= range[0] && lineNumber <= range[1]);
}

export function taskSpotlightTarget(task: SolidityLabTask): SpotlightTarget {
  if (task.spotlight) return task.spotlight;
  if (task.action && task.action !== 'focus') return task.action;
  if (task.lines) return 'lines';
  return 'editor';
}

export function TaskLessonContent({ task }: { task: SolidityLabTask }) {
  return (
    <>
      {task.note && <p>{task.note}</p>}
      {task.bullets && task.bullets.length > 0 && (
        <ul className={styles.ideLessonBullets}>
          {task.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export function spotlightSelector(target: SpotlightTarget) {
  switch (target) {
    case 'lesson':
      return '[data-lab-spotlight="lesson"]';
    case 'demo':
      return '[data-lab-spotlight="demo"]';
    case 'lines':
      return '[data-lab-active-line="true"]';
    case 'network':
      return '[data-lab-spotlight="network"]';
    case 'account':
      return '[data-lab-spotlight="account"]';
    case 'compile':
    case 'connect':
    case 'deploy':
    case 'write':
    case 'read':
      return `[data-lab-action="${target}"]`;
    case 'runtime':
      return '[data-lab-spotlight="runtime"]';
    case 'status':
      return '[data-lab-spotlight="status"]';
    case 'next':
      return '[data-lab-spotlight="next"]';
    case 'editor':
    default:
      return '[data-lab-spotlight="editor"]';
  }
}

export function SpotlightOnlyTooltip(_props: TooltipRenderProps) {
  return null;
}

export async function compileSource(
  source: string,
  fileName: string,
  preferredContractName: string,
) {
  const input = {
    language: 'Solidity',
    sources: { [fileName]: { content: source } },
    settings: {
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };
  const output = JSON.parse(await compileInWorker(JSON.stringify(input)));
  const issues: CompilationIssue[] = (output.errors || []).map(
    (error: {
      severity?: string;
      formattedMessage?: string;
      message?: string;
      sourceLocation?: { start?: number };
    }) => ({
      severity: error.severity,
      message: error.formattedMessage || error.message || 'Compiler message',
      line: getIssueLine(source, error.sourceLocation),
    }),
  );
  const hasError = issues.some((issue) => issue.severity === 'error');
  const contracts = output.contracts?.[fileName] || {};
  const contractName = contracts[preferredContractName]
    ? preferredContractName
    : Object.keys(contracts)[0];
  const contract = contractName ? contracts[contractName] : undefined;

  if (hasError || !contract?.evm?.bytecode?.object) {
    return { issues, result: undefined };
  }

  return {
    issues,
    result: {
      abi: contract.abi,
      bytecode: `0x${contract.evm.bytecode.object}`,
      contractName,
    } satisfies CompilationResult,
  };
}

async function compileInWorker(input: string) {
  return new Promise<string>((resolve, reject) => {
    const workerUrl = URL.createObjectURL(
      new Blob([COMPILER_WORKER_SOURCE], { type: 'text/javascript' }),
    );
    const worker = new Worker(workerUrl);
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    worker.onmessage = (event: MessageEvent<{ id: string; output?: string; error?: string }>) => {
      if (event.data.id !== id) return;
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      if (event.data.error) {
        reject(new Error(event.data.error));
        return;
      }
      resolve(event.data.output || '{}');
    };
    worker.onerror = (event) => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      reject(new Error(event.message));
    };
    worker.postMessage({
      id,
      input,
      version: SOLC_VERSION,
      binariesUrl: SOLC_BINARIES_URL,
    });
  });
}

const INDENT = '  ';
const PAIR_OPEN: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"' };

export function handleEditorKey(
  event: React.KeyboardEvent<HTMLTextAreaElement>,
  setCode: (next: string) => void,
) {
  const target = event.currentTarget;
  const { selectionStart, selectionEnd, value } = target;

  const isToggleComment = (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key === '/';
  if (isToggleComment) {
    event.preventDefault();
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEndRaw = value.indexOf('\n', selectionEnd);
    const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split('\n');
    const allCommented = lines.every((line) => /^\s*\/\//.test(line) || line.trim() === '');
    const transformed = lines
      .map((line) => {
        if (line.trim() === '') return line;
        if (allCommented) return line.replace(/^(\s*)\/\/ ?/, '$1');
        const indentMatch = line.match(/^\s*/)?.[0] ?? '';
        return `${indentMatch}// ${line.slice(indentMatch.length)}`;
      })
      .join('\n');
    const delta = transformed.length - block.length;
    setCode(`${value.slice(0, lineStart)}${transformed}${value.slice(lineEnd)}`);
    requestAnimationFrame(() => {
      target.selectionStart = selectionStart + (allCommented ? -3 : 3);
      target.selectionEnd = selectionEnd + delta;
    });
    return;
  }

  if (event.key in PAIR_OPEN && selectionStart === selectionEnd) {
    const close = PAIR_OPEN[event.key];
    if (event.key === '"' && value[selectionStart] === '"') return;
    event.preventDefault();
    const next = `${value.slice(0, selectionStart)}${event.key}${close}${value.slice(
      selectionEnd,
    )}`;
    setCode(next);
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = selectionStart + 1;
    });
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const before = value.slice(0, lineStart);
    const selected = value.slice(lineStart, selectionEnd);
    const after = value.slice(selectionEnd);
    if (event.shiftKey) {
      const dedented = selected.replace(new RegExp(`^${INDENT}`, 'gm'), '');
      const next = `${before}${dedented}${after}`;
      const removed = selected.length - dedented.length;
      setCode(next);
      requestAnimationFrame(() => {
        target.selectionStart = Math.max(lineStart, selectionStart - INDENT.length);
        target.selectionEnd = Math.max(lineStart, selectionEnd - removed);
      });
      return;
    }
    if (selectionStart === selectionEnd) {
      const next = `${value.slice(0, selectionStart)}${INDENT}${value.slice(selectionEnd)}`;
      setCode(next);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = selectionStart + INDENT.length;
      });
      return;
    }
    const indented = selected.replace(/^/gm, INDENT);
    const added = indented.length - selected.length;
    setCode(`${before}${indented}${after}`);
    requestAnimationFrame(() => {
      target.selectionStart = selectionStart + INDENT.length;
      target.selectionEnd = selectionEnd + added;
    });
    return;
  }

  if (event.key === 'Enter') {
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineSoFar = value.slice(lineStart, selectionStart);
    const indentMatch = lineSoFar.match(/^[ \t]*/)?.[0] ?? '';
    const trimmed = lineSoFar.trimEnd();
    const extra = trimmed.endsWith('{') || trimmed.endsWith('(') ? INDENT : '';
    const insert = `\n${indentMatch}${extra}`;
    if (!indentMatch && !extra) return;
    event.preventDefault();
    const next = `${value.slice(0, selectionStart)}${insert}${value.slice(selectionEnd)}`;
    setCode(next);
    const cursor = selectionStart + insert.length;
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = cursor;
    });
  }
}

export function resolveSolidityLanguage(): Language {
  return 'solidity' as Language;
}

export type LabMode = 'browser' | 'sepolia';
export type StatusKind = 'idle' | 'busy' | 'ok' | 'err';
export type ActionIconName = 'compile' | 'connect' | 'deploy' | 'write' | 'read';
export type ProcessVisual = 'compile' | 'deploy';

export function ActionIcon({ name }: { name: ActionIconName }) {
  const paths: Record<ActionIconName, React.ReactNode> = {
    compile: (
      <>
        <path d="M6 4h7l5 5v11H6z" />
        <path d="M13 4v5h5" />
        <path d="m9 14 2 2 4-5" />
      </>
    ),
    connect: (
      <>
        <path d="M8 7v4" />
        <path d="M16 7v4" />
        <path d="M6 11h12v2a6 6 0 0 1-12 0z" />
        <path d="M12 19v2" />
      </>
    ),
    deploy: (
      <>
        <path d="M12 3 5 7v10l7 4 7-4V7z" />
        <path d="M12 3v18" />
        <path d="m5 7 7 4 7-4" />
      </>
    ),
    write: (
      <>
        <path d="M5 5h14v14H5z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
        <path d="m14 16 2 2 3-4" />
      </>
    ),
    read: (
      <>
        <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
  };

  return (
    <svg
      className={styles.ideActionIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
