import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { ethers } from 'ethers';
import { usePrismTheme } from '@docusaurus/theme-common';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import {
  Joyride,
  EVENTS,
  ACTIONS,
  STATUS,
  Step,
  EventData,
  TooltipRenderProps,
} from 'react-joyride';
import { browserCall, browserDeploy, browserSend } from './browserChain';
import styles from './styles.module.css';

const LOCAL_DEVNET_MNEMONIC = 'test test test test test test test test test test test junk';

type DevAccount = {
  address: string;
  privateKey: string;
};

function deriveLocalDevnetAccounts(count: number): DevAccount[] {
  const wallets: DevAccount[] = [];
  for (let i = 0; i < count; i++) {
    const wallet = ethers.Wallet.fromMnemonic(LOCAL_DEVNET_MNEMONIC, `m/44'/60'/0'/0/${i}`);
    wallets.push({ address: wallet.address, privateKey: wallet.privateKey });
  }
  return wallets;
}

function pickFunctionName(
  abi: ethers.ContractInterface,
  matcher: (fragment: ethers.utils.FunctionFragment) => boolean,
) {
  const fragments = (Array.isArray(abi) ? abi : []) as ethers.utils.Fragment[];
  const fn = fragments.find(
    (f) => f.type === 'function' && matcher(f as ethers.utils.FunctionFragment),
  ) as ethers.utils.FunctionFragment | undefined;
  return fn?.name;
}

type LabAction = 'focus' | 'compile' | 'connect' | 'deploy' | 'write' | 'read';
type SpotlightTarget =
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
type LineRange = [number, number];

export type SolidityLabTask = {
  label: string;
  lines?: LineRange;
  note?: string;
  bullets?: string[];
  action?: LabAction;
  spotlight?: SpotlightTarget;
  placement?: Step['placement'];
};

type CompilationIssue = {
  severity?: string;
  message: string;
  line?: number;
};

type CompilationResult = {
  abi: ethers.ContractInterface;
  bytecode: string;
  contractName: string;
};

type ConsoleKind = 'info' | 'success' | 'error';

type LabConsoleEntry = {
  id: number;
  kind: ConsoleKind;
  source: string;
  message: string;
};

type ExplorerTransaction = {
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

const ARBITRUM_SEPOLIA = {
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

const LOCAL_DEVNET_ACCOUNT_COUNT = 5;
const COMPILE_INSTRUCTION_MS = 4200;
const DEPLOY_INSTRUCTION_MS = 4800;

const SOLC_BINARIES_URL = 'https://binaries.soliditylang.org/bin';
const SOLC_VERSION = '0.8.34';
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

function shortAddress(address?: string) {
  if (!address) return '—';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getIssueLine(source: string, sourceLocation?: { start?: number }) {
  if (!sourceLocation || typeof sourceLocation.start !== 'number' || sourceLocation.start < 0) {
    return undefined;
  }
  return source.slice(0, sourceLocation.start).split('\n').length;
}

function isLineActive(lineNumber: number, range?: LineRange) {
  return Boolean(range && lineNumber >= range[0] && lineNumber <= range[1]);
}

function taskSpotlightTarget(task: SolidityLabTask): SpotlightTarget {
  if (task.spotlight) return task.spotlight;
  if (task.action && task.action !== 'focus') return task.action;
  if (task.lines) return 'lines';
  return 'editor';
}

function TaskLessonContent({ task }: { task: SolidityLabTask }) {
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

function spotlightSelector(target: SpotlightTarget) {
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

function SpotlightOnlyTooltip(_props: TooltipRenderProps) {
  return null;
}

async function compileSource(source: string, fileName: string, preferredContractName: string) {
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

function handleEditorKey(
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

function resolveSolidityLanguage(): Language {
  const prismLanguages = (defaultProps.Prism as unknown as { languages: Record<string, unknown> })
    .languages;
  if (prismLanguages.solidity) return 'solidity' as Language;
  return 'clike' as Language;
}

type LabMode = 'browser' | 'sepolia';
type StatusKind = 'idle' | 'busy' | 'ok' | 'err';
type ActionIconName = 'compile' | 'connect' | 'deploy' | 'write' | 'read';
type ProcessVisual = 'compile' | 'deploy';

function ActionIcon({ name }: { name: ActionIconName }) {
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

export function SolidityLab({
  title = 'Solidity lab',
  description,
  source,
  fileName = 'VendingMachine.sol',
  contractName,
  height = 520,
  tasks = [],
  sidebarIntro,
  useSpotlight = false,
}: SolidityLabProps) {
  const storageKey = `solidity-lab:${fileName}:${contractName}`;
  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return source.trim();
    return window.localStorage.getItem(storageKey) ?? source.trim();
  });
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [issues, setIssues] = useState<CompilationIssue[]>([]);
  const [compiled, setCompiled] = useState<CompilationResult | undefined>();
  const [status, setStatus] = useState('Ready');
  const [statusKind, setStatusKind] = useState<StatusKind>('idle');
  const [manualRange, setManualRange] = useState<LineRange | undefined>();
  const [account, setAccount] = useState<string | undefined>();
  const [contractAddress, setContractAddress] = useState<string | undefined>();
  const [lastTxHash, setLastTxHash] = useState<string | undefined>();
  const [lastRead, setLastRead] = useState<string | undefined>();
  const [mode, setMode] = useState<LabMode>('browser');
  const browserAccountIndex = 0;
  const [completedActions, setCompletedActions] = useState<LabAction[]>([]);
  const [runningAction, setRunningAction] = useState<LabAction | undefined>();
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [spotlightMounted, setSpotlightMounted] = useState(false);
  const [spotlightRunning, setSpotlightRunning] = useState(useSpotlight);
  const [processVisual, setProcessVisual] = useState<ProcessVisual | undefined>();
  const [consoleEntries, setConsoleEntries] = useState<LabConsoleEntry[]>([
    {
      id: 1,
      kind: 'info',
      source: 'lab',
      message: `Loaded ${fileName}; compiler target solc ${SOLC_VERSION}.`,
    },
  ]);
  const [explorerTransactions, setExplorerTransactions] = useState<ExplorerTransaction[]>([]);
  const [selectedExplorerTxId, setSelectedExplorerTxId] = useState<number | undefined>();
  const runningActionRef = useRef<LabAction | undefined>();
  const codeLayerRef = useRef<HTMLPreElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const prismTheme = usePrismTheme();
  const highlightLanguage = useMemo(resolveSolidityLanguage, []);
  const devAccounts = useMemo(() => deriveLocalDevnetAccounts(LOCAL_DEVNET_ACCOUNT_COUNT), []);

  const activeTask = tasks[activeTaskIndex];
  const activeSpotlightTarget = activeTask ? taskSpotlightTarget(activeTask) : undefined;
  const activeRange =
    manualRange || (activeSpotlightTarget === 'lines' ? activeTask?.lines : undefined);
  const activeAction =
    activeTask?.action && activeTask.action !== 'focus' ? activeTask.action : undefined;
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
  const totalLines = useMemo(() => code.split('\n').length, [code]);
  const browserAccount = devAccounts[browserAccountIndex];
  const writeMethodName = useMemo(
    () =>
      compiled
        ? pickFunctionName(
            compiled.abi,
            (f) => f.stateMutability === 'nonpayable' || f.stateMutability === 'payable',
          )
        : undefined,
    [compiled],
  );
  const readMethodName = useMemo(
    () =>
      compiled
        ? pickFunctionName(
            compiled.abi,
            (f) => f.stateMutability === 'view' || f.stateMutability === 'pure',
          )
        : undefined,
    [compiled],
  );
  const writeCallLabel = `${writeMethodName ?? 'giveCupcakeTo'}(address)`;
  const readCallLabel = `${readMethodName ?? 'getCupcakeBalanceFor'}(address)`;
  const selectedExplorerTransaction = explorerTransactions.find(
    (tx) => tx.id === selectedExplorerTxId,
  );
  const isNetworkExplorerRelevant =
    activeAction === 'deploy' ||
    activeAction === 'connect' ||
    activeSpotlightTarget === 'network' ||
    Boolean(contractAddress);
  const isWalletExplorerRelevant =
    activeAction === 'deploy' ||
    activeAction === 'write' ||
    activeAction === 'read' ||
    activeSpotlightTarget === 'runtime' ||
    Boolean(contractAddress);
  const isTransactionsExplorerRelevant =
    activeAction === 'deploy' ||
    activeAction === 'write' ||
    activeSpotlightTarget === 'runtime' ||
    explorerTransactions.length > 0;
  const isContractExplorerRelevant =
    activeAction === 'compile' ||
    activeAction === 'deploy' ||
    activeAction === 'write' ||
    activeAction === 'read' ||
    activeSpotlightTarget === 'runtime' ||
    Boolean(compiled);
  const joyrideSteps = useMemo<Step[]>(
    () =>
      tasks.map((task) => {
        const target = taskSpotlightTarget(task);

        return {
          target: spotlightSelector(target),
          title: task.label,
          content: <TaskLessonContent task={task} />,
          placement:
            task.placement ||
            (target === 'compile' ||
            target === 'connect' ||
            target === 'deploy' ||
            target === 'write' ||
            target === 'read' ||
            target === 'network' ||
            target === 'runtime'
              ? 'left'
              : 'bottom'),
          skipBeacon: true,
          skipScroll: true,
          overlayClickAction: false,
          dismissKeyAction: false,
          blockTargetInteraction: true,
          spotlightPadding: target === 'lines' ? 3 : 6,
          data: { target },
        } satisfies Step;
      }),
    [tasks],
  );

  useEffect(() => {
    setSpotlightMounted(true);
  }, []);

  useEffect(() => {
    if (mode === 'browser') {
      setAccount(browserAccount?.address);
      setCompletedActions((current) =>
        current.includes('connect') ? current : [...current, 'connect'],
      );
    } else {
      setAccount(undefined);
      setCompletedActions((current) => current.filter((action) => action !== 'connect'));
    }
  }, [mode, browserAccount]);

  const update = (next: string, kind: StatusKind = 'idle') => {
    setStatus(next);
    setStatusKind(kind);
  };

  const pushConsole = (sourceName: string, message: string, kind: ConsoleKind = 'info') => {
    setConsoleEntries((current) => [
      ...current.slice(-79),
      {
        id: current.length > 0 ? current[current.length - 1].id + 1 : 1,
        kind,
        source: sourceName,
        message,
      },
    ]);
  };

  const addExplorerTransaction = (entry: Omit<ExplorerTransaction, 'id' | 'network' | 'link'>) => {
    setExplorerTransactions((current) => {
      const id = current.length > 0 ? current[0].id + 1 : 1;
      return [
        {
          ...entry,
          id,
          network: mode,
          link:
            mode === 'sepolia'
              ? `${ARBITRUM_SEPOLIA.blockExplorerUrls[0]}tx/${entry.hash}`
              : undefined,
        },
        ...current,
      ].slice(0, 5);
    });
  };

  const markActionDone = (action: LabAction) => {
    setCompletedActions((current) => (current.includes(action) ? current : [...current, action]));
  };

  const moveToNextTask = () => {
    setManualRange(undefined);
    setTutorialComplete(false);
    setActiveTaskIndex((index) => Math.min(index + 1, Math.max(tasks.length - 1, 0)));
    if (useSpotlight) setSpotlightRunning(true);
  };

  const moveToPreviousTask = () => {
    setManualRange(undefined);
    setTutorialComplete(false);
    setActiveTaskIndex((index) => Math.max(index - 1, 0));
    if (useSpotlight) setSpotlightRunning(true);
  };

  const completeAction = (action: LabAction) => {
    markActionDone(action);
    if (activeAction === action && tasks.length > 0) {
      moveToNextTask();
    }
  };

  const clearActions = (...actions: LabAction[]) => {
    setCompletedActions((current) => current.filter((action) => !actions.includes(action)));
  };

  const isActionDone = (action: LabAction) => completedActions.includes(action);

  const isCurrentAction = (action: LabAction) => activeAction === action;

  const isActiveSpotlight = (target: SpotlightTarget) =>
    Boolean(useSpotlight && activeSpotlightTarget === target);

  const beginRunningAction = (action: LabAction) => {
    if (runningActionRef.current) return false;
    runningActionRef.current = action;
    setRunningAction(action);
    return true;
  };

  const endRunningAction = (action: LabAction) => {
    if (runningActionRef.current !== action) return;
    runningActionRef.current = undefined;
    setRunningAction(undefined);
  };

  const canRunAction = (action: LabAction) => {
    if (runningAction || runningActionRef.current) return false;
    if (!isCurrentAction(action)) return false;
    if (isActionDone(action)) return false;
    if (action === 'compile') return true;
    if (action === 'deploy') return Boolean(compiled);
    if (action === 'write' || action === 'read') return Boolean(compiled && contractAddress);
    return false;
  };

  const isTaskSatisfied = (task?: SolidityLabTask) => {
    if (!task?.action || task.action === 'focus') return true;
    if (task.action === 'connect' && mode === 'browser') return Boolean(account);
    return isActionDone(task.action);
  };

  const canAdvanceTask = isTaskSatisfied(activeTask) && activeTaskIndex < tasks.length - 1;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (code === source.trim()) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    window.localStorage.setItem(storageKey, code);
  }, [code, source, storageKey]);

  const runCompileRef =
    useRef<(advanceOnSuccess?: boolean) => Promise<CompilationResult | undefined>>();
  const deployRef = useRef<() => Promise<void>>();
  const runCompile = async (advanceOnSuccess = true) => {
    if (!beginRunningAction('compile')) return undefined;
    setProcessVisual('compile');
    const visualPromise = wait(COMPILE_INSTRUCTION_MS).then(() => {
      setProcessVisual((current) => (current === 'compile' ? undefined : current));
    });
    update('Compiling…', 'busy');
    pushConsole('solc', `compile ${fileName} using ${SOLC_VERSION}`);
    setContractAddress(undefined);
    setLastTxHash(undefined);
    setExplorerTransactions([]);
    setSelectedExplorerTxId(undefined);
    clearActions('compile', 'deploy', 'write', 'read');
    try {
      const next = await compileSource(code, fileName, contractName);
      await visualPromise;
      setIssues(next.issues);
      setCompiled(next.result);
      if (next.result) {
        pushConsole(
          'solc',
          `ok ${next.result.contractName}: abi=${
            Array.isArray(next.result.abi) ? next.result.abi.length : 0
          } entries bytecode=${Math.max(0, (next.result.bytecode.length - 2) / 2)} bytes warnings=${
            next.issues.filter((issue) => issue.severity === 'warning').length
          }`,
          'success',
        );
        if (advanceOnSuccess) {
          completeAction('compile');
        } else {
          markActionDone('compile');
        }
        update(`Compiled ${next.result.contractName}`, 'ok');
      } else {
        pushConsole(
          'solc',
          `failed: ${next.issues.filter((issue) => issue.severity === 'error').length} errors, ${
            next.issues.filter((issue) => issue.severity === 'warning').length
          } warnings`,
          'error',
        );
        update('Compile failed', 'err');
      }
      return next.result;
    } catch (error) {
      await visualPromise;
      pushConsole('solc', error instanceof Error ? error.message : 'Compile failed', 'error');
      update(error instanceof Error ? error.message : 'Compile failed', 'err');
      return undefined;
    } finally {
      endRunningAction('compile');
    }
  };
  runCompileRef.current = runCompile;

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onKey = (event: KeyboardEvent) => {
      const isCompile = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b';
      const isDeploy = (event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Enter';
      if (isCompile) {
        event.preventDefault();
        runCompileRef.current?.();
      } else if (isDeploy) {
        event.preventDefault();
        deployRef.current?.();
      }
    };
    editor.addEventListener('keydown', onKey);
    return () => editor.removeEventListener('keydown', onKey);
  }, []);

  const connectWallet = async () => {
    if (mode === 'browser') {
      pushConsole('devnet', `selected account #${browserAccountIndex} ${browserAccount?.address}`);
      update(`Using local devnet account #${browserAccountIndex}`, 'ok');
      completeAction('connect');
      return undefined;
    }
    const ethereum = (window as unknown as { ethereum?: ethers.providers.ExternalProvider })
      .ethereum;
    if (!ethereum || typeof ethereum.request !== 'function') {
      pushConsole('wallet', 'no injected EIP-1193 provider found', 'error');
      update('No injected wallet found — switch to browser mode', 'err');
      return undefined;
    }
    update('Connecting wallet…', 'busy');
    pushConsole(
      'wallet',
      `request eth_requestAccounts; switch chain ${ARBITRUM_SEPOLIA.chainIdHex}`,
    );
    try {
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      await ensureArbitrumSepolia(ethereum);
      setAccount(accounts[0]);
      completeAction('connect');
      pushConsole('wallet', `connected ${accounts[0]}`, 'success');
      update('Wallet connected', 'ok');
      return new ethers.providers.Web3Provider(ethereum).getSigner();
    } catch (error) {
      pushConsole('wallet', error instanceof Error ? error.message : 'Connect failed', 'error');
      update(error instanceof Error ? error.message : 'Connect failed', 'err');
      return undefined;
    }
  };

  const ensureSepoliaSigner = async () => {
    const ethereum = (window as unknown as { ethereum?: ethers.providers.ExternalProvider })
      .ethereum;
    if (!ethereum || typeof ethereum.request !== 'function') return connectWallet();
    const provider = new ethers.providers.Web3Provider(ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) return connectWallet();
    await ensureArbitrumSepolia(ethereum);
    setAccount(accounts[0]);
    return provider.getSigner();
  };

  const deployContract = async () => {
    if (!isCurrentAction('deploy') || isActionDone('deploy')) return;
    if (!beginRunningAction('deploy')) return;
    if (!compiled) {
      endRunningAction('deploy');
      pushConsole('deploy', 'compile the contract before deploying', 'error');
      update('Compile first', 'err');
      return;
    }
    const compilation = compiled;
    setProcessVisual('deploy');
    const visualPromise = wait(DEPLOY_INSTRUCTION_MS).then(() => {
      setProcessVisual((current) => (current === 'deploy' ? undefined : current));
    });
    if (mode === 'browser') {
      if (!browserAccount) {
        await visualPromise;
        setProcessVisual(undefined);
        endRunningAction('deploy');
        return;
      }
      update('Deploying…', 'busy');
      pushConsole(
        'devnet',
        `deploy ${compilation.contractName}: from=${browserAccount.address} bytecode=${Math.max(
          0,
          (compilation.bytecode.length - 2) / 2,
        )} bytes`,
      );
      try {
        const result = browserDeploy(compilation.abi, compilation.bytecode, browserAccount.address);
        await visualPromise;
        setLastTxHash(result.txHash);
        setContractAddress(result.contractAddress);
        addExplorerTransaction({
          hash: result.txHash,
          method: 'Contract Creation',
          from: browserAccount.address,
          to: result.contractAddress,
          status: 'Success',
        });
        clearActions('write', 'read');
        completeAction('deploy');
        pushConsole(
          'devnet',
          `deployed contract=${result.contractAddress} tx=${result.txHash}`,
          'success',
        );
        update(`Local deploy ${shortAddress(result.contractAddress)}`, 'ok');
      } catch (error) {
        await visualPromise;
        pushConsole('devnet', error instanceof Error ? error.message : 'Deploy failed', 'error');
        update(error instanceof Error ? error.message : 'Deploy failed', 'err');
      } finally {
        endRunningAction('deploy');
      }
      return;
    }
    const signer = await ensureSepoliaSigner();
    if (!signer) {
      await visualPromise;
      setProcessVisual(undefined);
      endRunningAction('deploy');
      return;
    }
    update('Deploying…', 'busy');
    try {
      pushConsole('sepolia', `deploy ${compilation.contractName} via wallet signer`);
      const factory = new ethers.ContractFactory(compilation.abi, compilation.bytecode, signer);
      const contract = await factory.deploy();
      setLastTxHash(contract.deployTransaction.hash);
      pushConsole('sepolia', `submitted deploy tx=${contract.deployTransaction.hash}`);
      update('Waiting for deployment…', 'busy');
      await contract.deployed();
      await visualPromise;
      setContractAddress(contract.address);
      addExplorerTransaction({
        hash: contract.deployTransaction.hash,
        method: 'Contract Creation',
        from: await signer.getAddress(),
        to: contract.address,
        status: 'Success',
      });
      clearActions('write', 'read');
      completeAction('deploy');
      pushConsole('sepolia', `deployed contract=${contract.address}`, 'success');
      update(`Deployed at ${shortAddress(contract.address)}`, 'ok');
    } catch (error) {
      await visualPromise;
      pushConsole('sepolia', error instanceof Error ? error.message : 'Deploy failed', 'error');
      update(error instanceof Error ? error.message : 'Deploy failed', 'err');
    } finally {
      endRunningAction('deploy');
    }
  };
  deployRef.current = deployContract;

  const writeCupcake = async () => {
    if (!compiled || !contractAddress) {
      update('Deploy first', 'err');
      return;
    }
    if (mode === 'browser') {
      if (!browserAccount) return;
      const fnName = pickFunctionName(
        compiled.abi,
        (f) => f.stateMutability === 'nonpayable' || f.stateMutability === 'payable',
      );
      if (!fnName) {
        pushConsole('abi', 'no nonpayable/payable function found for write call', 'error');
        update('No state-changing function in ABI', 'err');
        return;
      }
      update('Sending tx…', 'busy');
      pushConsole(
        'devnet',
        `call ${fnName}(${browserAccount.address}) on ${contractAddress} from=${browserAccount.address}`,
      );
      try {
        const result = browserSend(
          contractAddress,
          compiled.abi,
          fnName,
          [browserAccount.address],
          browserAccount.address,
        );
        setLastTxHash(result.txHash);
        addExplorerTransaction({
          hash: result.txHash,
          method: fnName,
          from: browserAccount.address,
          to: contractAddress,
          status: result.status === 1 ? 'Success' : 'Reverted',
        });
        if (result.status === 1) {
          completeAction('write');
          pushConsole('devnet', `tx confirmed hash=${result.txHash} status=1`, 'success');
          update('Tx confirmed', 'ok');
        } else {
          pushConsole('devnet', result.revertReason || 'tx reverted', 'error');
          update(result.revertReason || 'Tx reverted', 'err');
        }
      } catch (error) {
        pushConsole('devnet', error instanceof Error ? error.message : 'Tx failed', 'error');
        update(error instanceof Error ? error.message : 'Tx failed', 'err');
      }
      return;
    }
    const signer = await ensureSepoliaSigner();
    if (!signer) return;
    update('Sending tx…', 'busy');
    try {
      const contract = new ethers.Contract(contractAddress, compiled.abi, signer);
      const signerAddress = await signer.getAddress();
      pushConsole('sepolia', `call giveCupcakeTo(${signerAddress}) on ${contractAddress}`);
      const tx = await contract.giveCupcakeTo(signerAddress);
      setLastTxHash(tx.hash);
      pushConsole('sepolia', `submitted tx=${tx.hash}`);
      await tx.wait();
      addExplorerTransaction({
        hash: tx.hash,
        method: 'giveCupcakeTo',
        from: signerAddress,
        to: contractAddress,
        status: 'Success',
      });
      completeAction('write');
      pushConsole('sepolia', `tx confirmed hash=${tx.hash}`, 'success');
      update('Tx confirmed', 'ok');
    } catch (error) {
      pushConsole('sepolia', error instanceof Error ? error.message : 'Tx failed', 'error');
      update(error instanceof Error ? error.message : 'Tx failed', 'err');
    }
  };

  const readBalance = async () => {
    if (!compiled || !contractAddress) {
      update('Deploy first', 'err');
      return;
    }
    if (mode === 'browser') {
      if (!browserAccount) return;
      const fnName = pickFunctionName(
        compiled.abi,
        (f) => f.stateMutability === 'view' || f.stateMutability === 'pure',
      );
      if (!fnName) {
        pushConsole('abi', 'no view/pure function found for read call', 'error');
        update('No view function in ABI', 'err');
        return;
      }
      update('Reading…', 'busy');
      pushConsole('devnet', `eth_call ${fnName}(${browserAccount.address}) on ${contractAddress}`);
      try {
        const result = browserCall(contractAddress, compiled.abi, fnName, [browserAccount.address]);
        if (result.revertReason) {
          pushConsole('devnet', result.revertReason, 'error');
          update(result.revertReason, 'err');
          return;
        }
        const value = result.result[0];
        const text = typeof value === 'bigint' ? value.toString() : String(value);
        setLastRead(text);
        completeAction('read');
        pushConsole('devnet', `return ${text}`, 'success');
        update(`Balance ${text}`, 'ok');
      } catch (error) {
        pushConsole('devnet', error instanceof Error ? error.message : 'Read failed', 'error');
        update(error instanceof Error ? error.message : 'Read failed', 'err');
      }
      return;
    }
    const signer = await ensureSepoliaSigner();
    if (!signer) return;
    update('Reading…', 'busy');
    try {
      const contract = new ethers.Contract(contractAddress, compiled.abi, signer);
      const signerAddress = await signer.getAddress();
      pushConsole(
        'sepolia',
        `eth_call getCupcakeBalanceFor(${signerAddress}) on ${contractAddress}`,
      );
      const balance = await contract.getCupcakeBalanceFor(signerAddress);
      setLastRead(balance.toString());
      completeAction('read');
      pushConsole('sepolia', `return ${balance.toString()}`, 'success');
      update(`Balance ${balance.toString()}`, 'ok');
    } catch (error) {
      pushConsole('sepolia', error instanceof Error ? error.message : 'Read failed', 'error');
      update(error instanceof Error ? error.message : 'Read failed', 'err');
    }
  };

  const advanceTask = () => {
    if (tasks.length === 0 || !canAdvanceTask) return;
    moveToNextTask();
  };

  const handlePrimaryLessonAction = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.currentTarget.blur();
    if (tutorialComplete && activeTaskIndex === tasks.length - 1) return;
    if (!activeTask) return;
    if (activeTask.action === 'compile') {
      runCompile();
      return;
    }
    if (activeTask.action === 'deploy') {
      deployContract();
      return;
    }
    if (activeTask.action === 'write') {
      writeCupcake();
      return;
    }
    if (activeTask.action === 'read') {
      readBalance();
      return;
    }
    if (activeTaskIndex === tasks.length - 1) {
      finishTutorial();
      return;
    }
    advanceTask();
  };

  const primaryLessonLabel = (() => {
    if (activeTask?.action === 'compile') return 'Compile';
    if (activeTask?.action === 'deploy') return 'Deploy';
    if (activeTask?.action === 'write') return `call ${writeCallLabel}`;
    if (activeTask?.action === 'read') return `call ${readCallLabel}`;
    return activeTaskIndex === tasks.length - 1 ? 'Done' : 'Next';
  })();

  const primaryLessonIcon =
    activeTask?.action && activeTask.action !== 'focus' ? activeTask.action : undefined;

  const canUsePrimaryLessonAction = (() => {
    if (tutorialComplete && activeTaskIndex === tasks.length - 1) return false;
    if (activeTask?.action && activeTask.action !== 'focus') return canRunAction(activeTask.action);
    return isTaskSatisfied(activeTask);
  })();

  const retreatTask = () => {
    if (tasks.length === 0 || activeTaskIndex === 0) return;
    moveToPreviousTask();
  };

  const finishTutorial = () => {
    if (!isTaskSatisfied(activeTask)) return;
    setManualRange(undefined);
    setTutorialComplete(true);
    setSpotlightRunning(false);
  };

  return (
    <section
      className={styles.solidityLab}
      data-solidity-lab
      style={{ '--ide-editor-height': `${height}px` } as React.CSSProperties}
    >
      {useSpotlight && spotlightMounted && joyrideSteps.length > 0 && (
        <Joyride
          steps={joyrideSteps}
          stepIndex={activeTaskIndex}
          run={spotlightRunning}
          continuous
          scrollToFirstStep={false}
          tooltipComponent={SpotlightOnlyTooltip}
          floatingOptions={{ hideArrow: true }}
          onEvent={(data: EventData) => {
            if (
              data.type === EVENTS.STEP_AFTER &&
              (data.action === ACTIONS.NEXT || data.action === ACTIONS.CLOSE)
            ) {
              advanceTask();
            }
            if (data.type === EVENTS.STEP_AFTER && data.action === ACTIONS.PREV) {
              moveToPreviousTask();
            }
            if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
              setManualRange(undefined);
              setSpotlightRunning(false);
            }
          }}
          locale={{ next: 'Next', back: 'Back', close: 'Close', last: 'Done' }}
          options={{
            overlayColor: 'transparent',
            primaryColor: 'var(--ide-accent)',
            backgroundColor: 'var(--ide-side)',
            textColor: 'var(--ide-fg)',
            zIndex: 10000,
            hideOverlay: true,
            spotlightRadius: 5,
            scrollDuration: 0,
            scrollOffset: 0,
            showProgress: false,
            skipScroll: true,
            disableFocusTrap: true,
          }}
          styles={{
            arrow: {
              display: 'none',
            },
            overlay: {
              backgroundColor: 'transparent',
              mixBlendMode: 'normal',
            },
            tooltip: {
              border: '1px solid var(--ide-spotlight-border)',
              backgroundColor: 'var(--ide-side)',
              borderRadius: 6,
              boxShadow: '0 18px 44px rgb(0 0 0 / 36%)',
              fontFamily: 'var(--ifm-font-family-base)',
              maxWidth: 380,
              padding: 18,
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            tooltipTitle: {
              color: 'var(--ide-fg)',
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.35,
            },
            tooltipContent: {
              color: 'var(--ide-chrome-fg)',
              fontSize: 13,
              lineHeight: 1.45,
              padding: '8px 0 0',
            },
            tooltipFooter: {
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
            },
            buttonBack: {
              border: '1px solid var(--ide-border)',
              borderRadius: 3,
              color: 'var(--ide-chrome-fg)',
              fontSize: 12,
              padding: '7px 10px',
            },
            buttonPrimary: {
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 800,
              padding: '8px 12px',
            },
            buttonClose: {
              color: 'var(--ide-muted)',
              height: 26,
              width: 26,
            },
          }}
        />
      )}
      <div className={styles.ideWorkbench} data-has-info={sidebarIntro ? 'true' : 'false'}>
        {sidebarIntro && (
          <aside className={styles.ideInfoPanel} aria-label="Lesson information">
            <div className={styles.ideLessonPanel} data-lab-spotlight="lesson">
              {sidebarIntro}
              {activeTask && (
                <div className={styles.ideLessonStepPanel} aria-live="polite">
                  <div className={styles.ideLessonStepContent}>
                    <div className={styles.ideLessonStepMeta}>
                      <span>
                        Step {activeTaskIndex + 1} / {tasks.length}
                      </span>
                      {activeTask.lines && (
                        <span>
                          L{activeTask.lines[0]}-{activeTask.lines[1]}
                        </span>
                      )}
                    </div>
                    <strong>{activeTask.label}</strong>
                    <TaskLessonContent task={activeTask} />
                  </div>
                  {tasks.length > 1 && (
                    <div className={styles.ideLessonNav}>
                      <button
                        type="button"
                        className={clsx(styles.ideLessonNavButton, styles.ideLessonNavPrimary)}
                        onClick={handlePrimaryLessonAction}
                        disabled={!canUsePrimaryLessonAction}
                        data-lab-spotlight="next"
                      >
                        {primaryLessonIcon && <ActionIcon name={primaryLessonIcon} />}
                        {primaryLessonLabel}
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.ideLessonNavButton, styles.ideLessonNavGhost)}
                        onClick={retreatTask}
                        disabled={activeTaskIndex === 0}
                      >
                        Back
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
        <div className={styles.ideMainPane}>
          <div className={styles.ideTabBar}>
            <span className={styles.ideTabActive}>
              {fileName}
              {code !== source.trim() && (
                <span className={styles.ideModifiedDot} aria-label="Modified" title="Modified">
                  ●
                </span>
              )}
            </span>
          </div>
          <div
            className={styles.ideEditor}
            style={{ minHeight: height }}
            ref={editorRef}
            data-lab-spotlight="editor"
          >
            {activeTask && !useSpotlight && (
              <div className={styles.ideStepOverlay}>
                <div className={styles.ideStepOverlayMeta}>
                  <span>
                    {activeTaskIndex + 1} / {tasks.length}
                  </span>
                  {activeTask.lines && (
                    <span>
                      L{activeTask.lines[0]}-{activeTask.lines[1]}
                    </span>
                  )}
                </div>
                <strong>{activeTask.label}</strong>
                <TaskLessonContent task={activeTask} />
              </div>
            )}
            {tasks.length > 0 && !useSpotlight && (
              <button
                type="button"
                className={styles.ideStepNextButton}
                onClick={advanceTask}
                disabled={!canAdvanceTask}
                data-lab-spotlight="next"
              >
                Next
              </button>
            )}
            <Highlight
              Prism={defaultProps.Prism}
              theme={prismTheme}
              code={code}
              language={highlightLanguage}
            >
              {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  ref={codeLayerRef}
                  className={clsx(highlightClassName, styles.ideCodeLayer)}
                  style={style}
                  aria-hidden="true"
                >
                  <code>
                    {tokens.map((line, index) => {
                      const lineNumber = index + 1;
                      const issue = issues.find((item) => item.line === lineNumber);
                      const lineProps = getLineProps({ line });
                      const { key: lineKey, ...linePropsWithoutKey } = lineProps;
                      return (
                        <span
                          {...linePropsWithoutKey}
                          key={lineKey || lineNumber}
                          className={clsx(
                            lineProps.className,
                            styles.ideCodeLine,
                            isLineActive(lineNumber, activeRange) && styles.ideCodeLineActive,
                            issue?.severity === 'error' && styles.ideCodeLineError,
                            issue?.severity === 'warning' && styles.ideCodeLineWarning,
                          )}
                          data-active-line={
                            isLineActive(lineNumber, activeRange) ? 'true' : undefined
                          }
                          data-lab-active-line={
                            isLineActive(lineNumber, activeRange) ? 'true' : undefined
                          }
                        >
                          <span className={styles.ideLineNumber}>{lineNumber}</span>
                          <span className={styles.ideLineContent}>
                            {line.length === 0 ? (
                              <span> </span>
                            ) : (
                              line.map((token, key) => {
                                const tokenProps = getTokenProps({ token });
                                const { key: tokenKey, ...tokenPropsWithoutKey } = tokenProps;

                                return <span key={tokenKey || key} {...tokenPropsWithoutKey} />;
                              })
                            )}
                          </span>
                        </span>
                      );
                    })}
                  </code>
                </pre>
              )}
            </Highlight>
            <textarea
              value={code}
              wrap="off"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label={`${fileName} source editor`}
              className={styles.ideTextarea}
              onChange={(event) => {
                setCode(event.currentTarget.value);
                setCompiled(undefined);
                setContractAddress(undefined);
                setExplorerTransactions([]);
                setSelectedExplorerTxId(undefined);
                clearActions('compile', 'deploy', 'write', 'read');
              }}
              onKeyDown={(event) => handleEditorKey(event, setCode)}
              onSelect={(event) => {
                const target = event.currentTarget;
                const before = target.value.slice(0, target.selectionStart);
                const newlineIndex = before.lastIndexOf('\n');
                setCursor({
                  line: before.split('\n').length,
                  col: target.selectionStart - (newlineIndex === -1 ? -1 : newlineIndex),
                });
              }}
              onScroll={(event) => {
                if (!codeLayerRef.current) return;
                codeLayerRef.current.scrollTop = event.currentTarget.scrollTop;
                codeLayerRef.current.scrollLeft = event.currentTarget.scrollLeft;
              }}
            />
          </div>
          {issues.length > 0 && (
            <div className={styles.ideProblems} role="region" aria-label="Compiler problems">
              <div className={styles.ideProblemsHeader}>
                <strong>Problems</strong>
                <span>
                  {errorCount} errors · {warningCount} warnings
                </span>
              </div>
              <ul className={styles.ideProblemsList}>
                {issues.map((issue, index) => (
                  <li
                    key={`${issue.severity}-${issue.line}-${index}`}
                    className={clsx(
                      styles.ideProblemItem,
                      issue.severity === 'error' && styles.ideProblemItemError,
                      issue.severity === 'warning' && styles.ideProblemItemWarning,
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!issue.line) return;
                        setManualRange([issue.line, issue.line]);
                      }}
                    >
                      <span className={styles.ideProblemMeta}>
                        {issue.severity || 'info'}
                        {issue.line ? ` · L${issue.line}` : ''}
                      </span>
                      <span className={styles.ideProblemMessage}>{issue.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={styles.ideConsolePanel} aria-label="Technical console">
            <div className={styles.ideConsoleHeader}>
              <strong>Console</strong>
              <span>{consoleEntries.length} events</span>
            </div>
            <div className={styles.ideConsoleOutput} role="log" aria-live="polite">
              {consoleEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={clsx(
                    styles.ideConsoleLine,
                    entry.kind === 'success' && styles.ideConsoleLineSuccess,
                    entry.kind === 'error' && styles.ideConsoleLineError,
                  )}
                >
                  <span className={styles.ideConsolePrompt}>[{entry.source}]</span>
                  <span>{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
          {processVisual && (
            <div className={styles.ideProcessOverlay} aria-live="polite" aria-label={status}>
              <div className={styles.ideProcessStage} data-process={processVisual}>
                {processVisual === 'compile' ? (
                  <div className={styles.ideProcessDiagram}>
                    <div className={styles.ideProcessSource} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessFlow} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessArtifact} aria-hidden="true">
                      <span className={styles.ideBytecodeChunk} />
                      <span className={styles.ideBytecodeChunk} />
                      <span className={styles.ideBytecodeChunk} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.ideProcessDiagram} data-deploy="true">
                    <div className={styles.ideProcessArtifact} aria-hidden="true">
                      <span className={styles.ideDeployPayload} />
                    </div>
                    <div className={styles.ideProcessFlow} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessBlock} aria-hidden="true">
                      <span className={styles.ideDeployPayloadMini} />
                    </div>
                    <div className={styles.ideProcessFlow} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessChain} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                <strong>
                  {processVisual === 'compile' ? 'Compiling source' : 'Deploying contract'}
                </strong>
                <p>
                  {processVisual === 'compile'
                    ? 'Solidity source is being compressed into ABI and EVM bytecode.'
                    : 'Compiled bytecode is being placed into a new block on the selected network.'}
                </p>
              </div>
            </div>
          )}
        </div>
        <aside className={styles.ideActionPanel} aria-label="Block explorer">
          <div
            className={clsx(
              styles.ideExplorerNetworkPanel,
              !isNetworkExplorerRelevant && styles.ideExplorerItemDimmed,
            )}
          >
            <div className={styles.ideActionHeading}>Network</div>
            <div
              className={styles.ideModeSwitch}
              role="tablist"
              aria-label="Network"
              data-lab-spotlight="network"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'browser'}
                className={clsx(
                  styles.ideModeButton,
                  mode === 'browser' && styles.ideModeButtonActive,
                  isActiveSpotlight('network') && styles.ideModeButtonSpotlight,
                )}
                onClick={() => setMode('browser')}
              >
                Local Devnet
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'sepolia'}
                className={clsx(
                  styles.ideModeButton,
                  mode === 'sepolia' && styles.ideModeButtonActive,
                  isActiveSpotlight('network') && styles.ideModeButtonSpotlight,
                )}
                onClick={() => setMode('sepolia')}
              >
                Arbitrum Sepolia
              </button>
            </div>
            {mode === 'sepolia' && (
              <button
                type="button"
                className={clsx(
                  styles.ideExplorerCallButton,
                  isActiveSpotlight('connect') && styles.ideActionButtonSpotlight,
                )}
                onClick={connectWallet}
                data-lab-action="connect"
              >
                <ActionIcon name="connect" />
                Connect wallet
              </button>
            )}
          </div>
          <div
            className={clsx(
              styles.ideExplorerPanel,
              isActiveSpotlight('runtime') && styles.idePanelSpotlight,
            )}
            aria-label="Block explorer"
            data-lab-spotlight="runtime"
          >
            <div className={styles.ideExplorerHeader}>
              <div className={styles.ideActionHeading}>Block Explorer</div>
            </div>
            <div
              className={clsx(
                styles.ideExplorerSection,
                !isWalletExplorerRelevant && styles.ideExplorerItemDimmed,
              )}
            >
              <div className={styles.ideExplorerSectionTitle}>Connected Wallet</div>
              <dl className={styles.ideExplorerRows}>
                <div>
                  <dt>Wallet</dt>
                  <dd>{shortAddress(account)}</dd>
                </div>
                <div>
                  <dt>Contract</dt>
                  <dd>{shortAddress(contractAddress)}</dd>
                </div>
                <div>
                  <dt>Balance</dt>
                  <dd>{lastRead ? `${lastRead} cupcake${lastRead === '1' ? '' : 's'}` : '—'}</dd>
                </div>
              </dl>
            </div>
            <div
              className={clsx(
                styles.ideExplorerSection,
                !isTransactionsExplorerRelevant && styles.ideExplorerItemDimmed,
              )}
            >
              <div className={styles.ideExplorerSectionTitle}>Transactions</div>
              {explorerTransactions.length > 0 ? (
                <ul className={styles.ideExplorerTxList}>
                  {explorerTransactions.map((tx) => (
                    <li key={tx.id}>
                      <button
                        type="button"
                        className={clsx(
                          styles.ideExplorerTx,
                          selectedExplorerTransaction?.id === tx.id && styles.ideExplorerTxActive,
                        )}
                        onClick={() =>
                          setSelectedExplorerTxId((current) =>
                            current === tx.id ? undefined : tx.id,
                          )
                        }
                      >
                        <span className={styles.ideExplorerTxTop}>
                          <span className={styles.ideExplorerMethod}>{tx.method}</span>
                          <span
                            className={clsx(
                              styles.ideExplorerStatus,
                              tx.status === 'Success'
                                ? styles.ideExplorerStatusSuccess
                                : styles.ideExplorerStatusError,
                            )}
                          >
                            {tx.status}
                          </span>
                        </span>
                        <span className={styles.ideExplorerHash}>{shortAddress(tx.hash)}</span>
                        <span className={styles.ideExplorerTxMeta}>
                          From {shortAddress(tx.from)} To {shortAddress(tx.to)}
                        </span>
                        {selectedExplorerTransaction?.id === tx.id && (
                          <span className={styles.ideExplorerTxDetails}>
                            <span>
                              <strong>Hash</strong>
                              <span title={tx.hash}>{shortAddress(tx.hash)}</span>
                            </span>
                            <span>
                              <strong>Status</strong>
                              <span>{tx.status}</span>
                            </span>
                            <span>
                              <strong>Action</strong>
                              <span>{tx.method}</span>
                            </span>
                            <span>
                              <strong>From</strong>
                              <span title={tx.from}>{shortAddress(tx.from)}</span>
                            </span>
                            <span>
                              <strong>To</strong>
                              <span title={tx.to}>{shortAddress(tx.to)}</span>
                            </span>
                            {tx.link && (
                              <a
                                href={tx.link}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.ideExplorerExternalLink}
                              >
                                Open on Arbiscan
                              </a>
                            )}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.ideExplorerEmpty}>
                  Deploy to create the first transaction.
                </div>
              )}
            </div>
            <div
              className={clsx(
                styles.ideExplorerSection,
                !isContractExplorerRelevant && styles.ideExplorerItemDimmed,
              )}
            >
              <div className={styles.ideExplorerSectionTitle}>Contract</div>
              <dl className={styles.ideExplorerRows}>
                <div>
                  <dt>Name</dt>
                  <dd>{compiled?.contractName ?? contractName}</dd>
                </div>
                <div>
                  <dt>Call</dt>
                  <dd>{compiled ? writeCallLabel : '—'}</dd>
                </div>
                <div>
                  <dt>Call</dt>
                  <dd>{compiled ? readCallLabel : '—'}</dd>
                </div>
              </dl>
              <div className={styles.ideExplorerContractActions}>
                <button
                  type="button"
                  className={clsx(
                    styles.ideExplorerCallButton,
                    isActiveSpotlight('write') && styles.ideActionButtonSpotlight,
                  )}
                  onClick={writeCupcake}
                  disabled={!canRunAction('write')}
                  data-lab-action="write"
                >
                  <ActionIcon name="write" />
                  call {writeCallLabel}
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.ideExplorerCallButton,
                    isActiveSpotlight('read') && styles.ideActionButtonSpotlight,
                  )}
                  onClick={readBalance}
                  disabled={!canRunAction('read')}
                  data-lab-action="read"
                >
                  <ActionIcon name="read" />
                  call {readCallLabel}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div className={styles.ideStatusBar} role="status" data-lab-spotlight="status">
        <span className={styles.ideStatusSpacer} />
        <span className={styles.ideStatusItem}>
          Ln <strong>{cursor.line}</strong>, Col <strong>{cursor.col}</strong>
        </span>
        <span className={styles.ideStatusItem}>
          {totalLines} lines · Solidity · {SOLC_VERSION}
        </span>
        {lastTxHash && mode === 'sepolia' && (
          <a
            href={`${ARBITRUM_SEPOLIA.blockExplorerUrls[0]}tx/${lastTxHash}`}
            target="_blank"
            rel="noreferrer"
            className={styles.ideStatusLink}
          >
            View tx ↗
          </a>
        )}
      </div>
    </section>
  );
}

async function ensureArbitrumSepolia(ethereum: ethers.providers.ExternalProvider) {
  if (typeof ethereum.request !== 'function') return;
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARBITRUM_SEPOLIA.chainIdHex }],
    });
  } catch (error) {
    const switchError = error as { code?: number };
    if (switchError.code !== 4902) throw error;
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: ARBITRUM_SEPOLIA.chainIdHex,
          chainName: ARBITRUM_SEPOLIA.chainName,
          rpcUrls: ARBITRUM_SEPOLIA.rpcUrls,
          blockExplorerUrls: ARBITRUM_SEPOLIA.blockExplorerUrls,
          nativeCurrency: ARBITRUM_SEPOLIA.nativeCurrency,
        },
      ],
    });
  }
}
