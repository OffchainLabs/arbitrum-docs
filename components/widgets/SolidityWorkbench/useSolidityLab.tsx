'use client';

import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { Step } from 'react-joyride';
import {
  type Address,
  BaseError,
  type EIP1193Provider,
  createPublicClient,
  createWalletClient,
  custom,
} from 'viem';
import { arbitrumSepolia } from 'viem/chains';
// viem ships the `Window.ethereum` augmentation as its own module. Type-only, so nothing reaches
// the bundle.
import type {} from 'viem/window';

import {
  COMPILE_INSTRUCTION_MS,
  type CompilationIssue,
  type CompilationResult,
  type ConsoleKind,
  DEPLOY_INSTRUCTION_MS,
  type ExplorerTransaction,
  type LabAction,
  type LabConsoleEntry,
  type LabMode,
  type LineRange,
  type ProcessVisual,
  SOLC_VERSION,
  type SolidityLabProps,
  type SolidityLabTask,
  type SpotlightTarget,
  type StatusKind,
  TaskLessonContent,
  arbitrumSepoliaTxUrl,
  compileSource,
  shortAddress,
  spotlightSelector,
  taskSpotlightTarget,
  useHighlightedLines,
  wait,
} from './SolidityLabSupport';
import {
  BROWSER_ACCOUNT,
  browserCall,
  browserDeploy,
  browserSend,
  readFunctionName,
  writeFunctionName,
} from './browserChain';
import { ensureArbitrumSepolia } from './ensureArbitrumSepolia';

/**
 * Viem clients bound to the injected wallet and to the account it exposes. Both go through the
 * wallet's own RPC, so the page itself never calls an Arbitrum Sepolia endpoint.
 */
function sepoliaClients(provider: EIP1193Provider, account: Address) {
  const transport = custom(provider);
  return {
    account,
    wallet: createWalletClient({ account, chain: arbitrumSepolia, transport }),
    reader: createPublicClient({ chain: arbitrumSepolia, transport }),
  };
}

type SepoliaClients = ReturnType<typeof sepoliaClients>;

/** viem's `shortMessage` for its own errors: the full `message` adds request details and links. */
function errorMessage(error: unknown, fallback: string) {
  if (error instanceof BaseError) return error.shortMessage;
  return error instanceof Error ? error.message : fallback;
}

export function useSolidityLab({
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
  const [code, setCode] = useState(source.trim());
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [issues, setIssues] = useState<CompilationIssue[]>([]);
  const [compiled, setCompiled] = useState<CompilationResult | undefined>();
  const [status, setStatus] = useState('Ready');
  const [statusKind, setStatusKind] = useState<StatusKind>('idle');
  const [manualRange, setManualRange] = useState<LineRange | undefined>();
  const [account, setAccount] = useState<string | undefined>();
  const [contractAddress, setContractAddress] = useState<Address | undefined>();
  const [lastTxHash, setLastTxHash] = useState<string | undefined>();
  const [lastRead, setLastRead] = useState<string | undefined>();
  const [mode, setMode] = useState<LabMode>('browser');
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
  const runningActionRef = useRef<LabAction | undefined>(undefined);
  const codeLayerRef = useRef<HTMLPreElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const highlightedLines = useHighlightedLines(code);

  const activeTask = tasks[activeTaskIndex];
  const activeSpotlightTarget = activeTask ? taskSpotlightTarget(activeTask) : undefined;
  const activeRange =
    manualRange || (activeSpotlightTarget === 'lines' ? activeTask?.lines : undefined);
  const activeAction =
    activeTask?.action && activeTask.action !== 'focus' ? activeTask.action : undefined;
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
  const totalLines = useMemo(() => code.split('\n').length, [code]);
  const writeMethodName = useMemo(
    () => (compiled ? writeFunctionName(compiled.abi) : undefined),
    [compiled],
  );
  const readMethodName = useMemo(
    () => (compiled ? readFunctionName(compiled.abi) : undefined),
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
      setAccount(BROWSER_ACCOUNT);
      setCompletedActions((current) =>
        current.includes('connect') ? current : [...current, 'connect'],
      );
    } else {
      setAccount(undefined);
      setCompletedActions((current) => current.filter((action) => action !== 'connect'));
    }
  }, [mode]);

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
          link: mode === 'sepolia' ? arbitrumSepoliaTxUrl(entry.hash) : undefined,
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
    setCode(window.localStorage.getItem(storageKey) ?? source.trim());
    setStorageLoaded(true);
  }, [source, storageKey]);

  useEffect(() => {
    if (!storageLoaded) return;
    if (code === source.trim()) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    window.localStorage.setItem(storageKey, code);
  }, [code, source, storageKey, storageLoaded]);

  const runCompileRef =
    useRef<(advanceOnSuccess?: boolean) => Promise<CompilationResult | undefined>>(undefined);
  const deployRef = useRef<() => Promise<void>>(undefined);
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

  const connectWallet = async (): Promise<SepoliaClients | undefined> => {
    if (mode === 'browser') {
      pushConsole('devnet', `selected account #0 ${BROWSER_ACCOUNT}`);
      update('Using local devnet account #0', 'ok');
      completeAction('connect');
      return undefined;
    }
    const provider = window.ethereum;
    if (!provider) {
      pushConsole('wallet', 'no injected EIP-1193 provider found', 'error');
      update('No injected wallet found — switch to browser mode', 'err');
      return undefined;
    }
    update('Connecting wallet…', 'busy');
    pushConsole('wallet', `request eth_requestAccounts; switch chain ${arbitrumSepolia.id}`);
    try {
      const wallet = createWalletClient({ transport: custom(provider) });
      const [connected] = await wallet.requestAddresses();
      if (!connected) throw new Error('The wallet returned no account.');
      await ensureArbitrumSepolia(wallet);
      setAccount(connected);
      completeAction('connect');
      pushConsole('wallet', `connected ${connected}`, 'success');
      update('Wallet connected', 'ok');
      return sepoliaClients(provider, connected);
    } catch (error) {
      pushConsole('wallet', errorMessage(error, 'Connect failed'), 'error');
      update(errorMessage(error, 'Connect failed'), 'err');
      return undefined;
    }
  };

  const ensureSepoliaClients = async () => {
    const provider = window.ethereum;
    if (!provider) return connectWallet();
    const wallet = createWalletClient({ transport: custom(provider) });
    const [connected] = await wallet.getAddresses();
    if (!connected) return connectWallet();
    await ensureArbitrumSepolia(wallet);
    setAccount(connected);
    return sepoliaClients(provider, connected);
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
      update('Deploying…', 'busy');
      pushConsole(
        'devnet',
        `deploy ${compilation.contractName}: from=${BROWSER_ACCOUNT} bytecode=${Math.max(
          0,
          (compilation.bytecode.length - 2) / 2,
        )} bytes`,
      );
      try {
        const result = browserDeploy(compilation.abi, compilation.bytecode, BROWSER_ACCOUNT);
        await visualPromise;
        setLastTxHash(result.txHash);
        setContractAddress(result.contractAddress);
        addExplorerTransaction({
          hash: result.txHash,
          method: 'Contract Creation',
          from: BROWSER_ACCOUNT,
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
        pushConsole('devnet', errorMessage(error, 'Deploy failed'), 'error');
        update(errorMessage(error, 'Deploy failed'), 'err');
      } finally {
        endRunningAction('deploy');
      }
      return;
    }
    try {
      const clients = await ensureSepoliaClients();
      if (!clients) {
        await visualPromise;
        setProcessVisual(undefined);
        return;
      }
      update('Deploying…', 'busy');
      pushConsole('sepolia', `deploy ${compilation.contractName} via wallet signer`);
      const hash = await clients.wallet.deployContract({
        abi: compilation.abi,
        bytecode: compilation.bytecode,
      });
      setLastTxHash(hash);
      pushConsole('sepolia', `submitted deploy tx=${hash}`);
      update('Waiting for deployment…', 'busy');
      const receipt = await clients.reader.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success' || !receipt.contractAddress) {
        throw new Error(`Deployment transaction ${hash} reverted.`);
      }
      await visualPromise;
      const deployedAddress = receipt.contractAddress;
      setContractAddress(deployedAddress);
      addExplorerTransaction({
        hash,
        method: 'Contract Creation',
        from: clients.account,
        to: deployedAddress,
        status: 'Success',
      });
      clearActions('write', 'read');
      completeAction('deploy');
      pushConsole('sepolia', `deployed contract=${deployedAddress}`, 'success');
      update(`Deployed at ${shortAddress(deployedAddress)}`, 'ok');
    } catch (error) {
      await visualPromise;
      pushConsole('sepolia', errorMessage(error, 'Deploy failed'), 'error');
      update(errorMessage(error, 'Deploy failed'), 'err');
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
    const fnName = writeFunctionName(compiled.abi);
    if (!fnName) {
      pushConsole('abi', 'no nonpayable/payable function found for write call', 'error');
      update('No state-changing function in ABI', 'err');
      return;
    }
    if (mode === 'browser') {
      update('Sending tx…', 'busy');
      pushConsole(
        'devnet',
        `call ${fnName}(${BROWSER_ACCOUNT}) on ${contractAddress} from=${BROWSER_ACCOUNT}`,
      );
      try {
        const result = browserSend(
          contractAddress,
          compiled.abi,
          fnName,
          [BROWSER_ACCOUNT],
          BROWSER_ACCOUNT,
        );
        setLastTxHash(result.txHash);
        addExplorerTransaction({
          hash: result.txHash,
          method: fnName,
          from: BROWSER_ACCOUNT,
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
        pushConsole('devnet', errorMessage(error, 'Tx failed'), 'error');
        update(errorMessage(error, 'Tx failed'), 'err');
      }
      return;
    }
    try {
      const clients = await ensureSepoliaClients();
      if (!clients) return;
      update('Sending tx…', 'busy');
      pushConsole('sepolia', `call ${fnName}(${clients.account}) on ${contractAddress}`);
      const hash = await clients.wallet.writeContract({
        address: contractAddress,
        abi: compiled.abi,
        functionName: fnName,
        args: [clients.account],
      });
      setLastTxHash(hash);
      pushConsole('sepolia', `submitted tx=${hash}`);
      const receipt = await clients.reader.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') throw new Error(`Transaction ${hash} reverted.`);
      addExplorerTransaction({
        hash,
        method: fnName,
        from: clients.account,
        to: contractAddress,
        status: 'Success',
      });
      completeAction('write');
      pushConsole('sepolia', `tx confirmed hash=${hash}`, 'success');
      update('Tx confirmed', 'ok');
    } catch (error) {
      pushConsole('sepolia', errorMessage(error, 'Tx failed'), 'error');
      update(errorMessage(error, 'Tx failed'), 'err');
    }
  };

  const readBalance = async () => {
    if (!compiled || !contractAddress) {
      update('Deploy first', 'err');
      return;
    }
    const fnName = readFunctionName(compiled.abi);
    if (!fnName) {
      pushConsole('abi', 'no view/pure function found for read call', 'error');
      update('No view function in ABI', 'err');
      return;
    }
    if (mode === 'browser') {
      update('Reading…', 'busy');
      pushConsole('devnet', `eth_call ${fnName}(${BROWSER_ACCOUNT}) on ${contractAddress}`);
      try {
        const result = browserCall(contractAddress, compiled.abi, fnName, [BROWSER_ACCOUNT]);
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
        pushConsole('devnet', errorMessage(error, 'Read failed'), 'error');
        update(errorMessage(error, 'Read failed'), 'err');
      }
      return;
    }
    try {
      const clients = await ensureSepoliaClients();
      if (!clients) return;
      update('Reading…', 'busy');
      pushConsole('sepolia', `eth_call ${fnName}(${clients.account}) on ${contractAddress}`);
      const balance = await clients.reader.readContract({
        address: contractAddress,
        abi: compiled.abi,
        functionName: fnName,
        args: [clients.account],
      });
      const text = String(balance);
      setLastRead(text);
      completeAction('read');
      pushConsole('sepolia', `return ${text}`, 'success');
      update(`Balance ${text}`, 'ok');
    } catch (error) {
      pushConsole('sepolia', errorMessage(error, 'Read failed'), 'error');
      update(errorMessage(error, 'Read failed'), 'err');
    }
  };

  const advanceTask = () => {
    if (tasks.length === 0 || !canAdvanceTask) return;
    moveToNextTask();
  };

  const handlePrimaryLessonAction = (event?: MouseEvent<HTMLButtonElement>) => {
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

  return {
    title,
    description,
    source,
    fileName,
    contractName,
    height,
    tasks,
    sidebarIntro,
    useSpotlight,
    code,
    setCode,
    activeTaskIndex,
    tutorialComplete,
    issues,
    setIssues,
    compiled,
    setCompiled,
    status,
    statusKind,
    manualRange,
    setManualRange,
    account,
    contractAddress,
    setContractAddress,
    lastTxHash,
    lastRead,
    mode,
    setMode,
    completedActions,
    runningAction,
    cursor,
    setCursor,
    spotlightMounted,
    spotlightRunning,
    setSpotlightRunning,
    processVisual,
    consoleEntries,
    explorerTransactions,
    setExplorerTransactions,
    selectedExplorerTxId,
    setSelectedExplorerTxId,
    codeLayerRef,
    editorRef,
    highlightedLines,
    activeTask,
    activeRange,
    activeAction,
    errorCount,
    warningCount,
    totalLines,
    writeCallLabel,
    readCallLabel,
    selectedExplorerTransaction,
    isNetworkExplorerRelevant,
    isWalletExplorerRelevant,
    isTransactionsExplorerRelevant,
    isContractExplorerRelevant,
    joyrideSteps,
    moveToNextTask,
    moveToPreviousTask,
    clearActions,
    isActiveSpotlight,
    canRunAction,
    canAdvanceTask,
    runCompile,
    connectWallet,
    deployContract,
    writeCupcake,
    readBalance,
    advanceTask,
    handlePrimaryLessonAction,
    primaryLessonLabel,
    primaryLessonIcon,
    canUsePrimaryLessonAction,
    retreatTask,
  };
}
