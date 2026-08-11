import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { usePrismTheme } from '@docusaurus/theme-common';
import { Step } from 'react-joyride';
import { browserCall, browserDeploy, browserSend } from './browserChain';
import { ensureArbitrumSepolia } from './ensureArbitrumSepolia';
import {
  ARBITRUM_SEPOLIA,
  COMPILE_INSTRUCTION_MS,
  DEPLOY_INSTRUCTION_MS,
  LOCAL_DEVNET_ACCOUNT_COUNT,
  SOLC_VERSION,
  CompilationIssue,
  CompilationResult,
  ConsoleKind,
  ExplorerTransaction,
  LabAction,
  LabConsoleEntry,
  LabMode,
  LineRange,
  ProcessVisual,
  SolidityLabProps,
  SolidityLabTask,
  SpotlightTarget,
  StatusKind,
  compileSource,
  deriveLocalDevnetAccounts,
  pickFunctionName,
  resolveSolidityLanguage,
  shortAddress,
  spotlightSelector,
  taskSpotlightTarget,
  TaskLessonContent,
  wait,
} from './SolidityLabSupport';

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
  const [devAccounts, setDevAccounts] = useState<ReturnType<typeof deriveLocalDevnetAccounts>>([]);

  useEffect(() => {
    setDevAccounts(deriveLocalDevnetAccounts(LOCAL_DEVNET_ACCOUNT_COUNT));
  }, []);

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
    const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
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
      return new ethers.BrowserProvider(ethereum).getSigner();
    } catch (error) {
      pushConsole('wallet', error instanceof Error ? error.message : 'Connect failed', 'error');
      update(error instanceof Error ? error.message : 'Connect failed', 'err');
      return undefined;
    }
  };

  const ensureSepoliaSigner = async () => {
    const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
    if (!ethereum || typeof ethereum.request !== 'function') return connectWallet();
    const provider = new ethers.BrowserProvider(ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) return connectWallet();
    await ensureArbitrumSepolia(ethereum);
    setAccount(await accounts[0].getAddress());
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
      const deployTransaction = contract.deploymentTransaction();
      if (!deployTransaction) throw new Error('Deployment transaction is unavailable.');
      setLastTxHash(deployTransaction.hash);
      pushConsole('sepolia', `submitted deploy tx=${deployTransaction.hash}`);
      update('Waiting for deployment…', 'busy');
      await contract.waitForDeployment();
      await visualPromise;
      const deployedAddress = await contract.getAddress();
      setContractAddress(deployedAddress);
      addExplorerTransaction({
        hash: deployTransaction.hash,
        method: 'Contract Creation',
        from: await signer.getAddress(),
        to: deployedAddress,
        status: 'Success',
      });
      clearActions('write', 'read');
      completeAction('deploy');
      pushConsole('sepolia', `deployed contract=${deployedAddress}`, 'success');
      update(`Deployed at ${shortAddress(deployedAddress)}`, 'ok');
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
    prismTheme,
    highlightLanguage,
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
